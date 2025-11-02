import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, FileText, Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, Class } from "@/lib/api/classApi";
import { assignmentApi, AssignmentDTO } from "@/lib/api/assignmentApi";
import { toast } from "sonner";

const teacherNavItems = [
  { title: "Dashboard", path: "/teacher/dashboard", icon: BookOpen },
  { title: "Classes", path: "/teacher/classes", icon: Users },
  { title: "Notes", path: "/teacher/notes", icon: FileText },
  { title: "Assignments", path: "/teacher/assignments", icon: FileText },
  { title: "Grades", path: "/teacher/grades", icon: FileText },
  { title: "Profile", path: "/teacher/profile", icon: Users },
];

const TeacherDashboard = () => {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const teacherName = (teacher?.name && teacher.name.trim() !== '') 
    ? teacher.name 
    : (teacher?.username || "Teacher");

  // Real-time data states
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<Array<{
    id: number;
    title: string;
    class: string;
    dueDate: string;
    submissions: number;
    total: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch classes
      const classesResponse = await classApi.getClasses();
      let totalClasses = 0;
      let totalStudents = 0;
      const classMap = new Map<number, Class>();

      if (classesResponse.success && classesResponse.data) {
        totalClasses = classesResponse.data.length;
        
        // Store classes in map for later use
        classesResponse.data.forEach((cls) => {
          if (cls.id) {
            classMap.set(cls.id, cls);
          }
        });

        // Calculate total students from all classes
        totalStudents = classesResponse.data.reduce((sum, cls) => {
          return sum + (cls.students || 0);
        }, 0);
      }

      // Fetch all assignments and count pending ones
      let pendingCount = 0;
      const assignmentsList: Array<{
        id: number;
        title: string;
        classId: number;
        className: string;
        dueDate: string;
        courseId: number;
      }> = [];

      if (classesResponse.success && classesResponse.data) {
        // Fetch assignments for each class
        for (const classItem of classesResponse.data) {
          if (classItem.id) {
            try {
              const assignmentsResponse = await assignmentApi.getAssignmentsByClass(classItem.id);
              
              if (assignmentsResponse.success && assignmentsResponse.data) {
                for (const assignment of assignmentsResponse.data) {
                  assignmentsList.push({
                    id: assignment.id || 0,
                    title: assignment.title,
                    classId: classItem.id,
                    className: classItem.name,
                    dueDate: assignment.dueDate,
                    courseId: assignment.courseId,
                  });

                  // Store assignment for later submission fetching
                }
              }
            } catch (error) {
              console.error(`Error fetching assignments for class ${classItem.id}:`, error);
            }
          }
        }
      }

      // Sort assignments by due date and take most recent 3
      const sortedAssignments = assignmentsList
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .slice(0, 3);

      // Create a map to store submissions data (avoid duplicate fetches)
      const submissionsMap = new Map<number, any[]>();
      
      // Fetch submissions for ALL assignments to count pending (can be optimized later with backend aggregation)
      const allSubmissionsPromises = assignmentsList.map(async (assignment) => {
        try {
          const submissionsResponse = await assignmentApi.getSubmissionsByAssignment(assignment.id);
          if (submissionsResponse.success && submissionsResponse.data) {
            // Store in map for reuse
            submissionsMap.set(assignment.id, submissionsResponse.data);
            return submissionsResponse.data;
          }
          submissionsMap.set(assignment.id, []);
          return [];
        } catch (error) {
          console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
          submissionsMap.set(assignment.id, []);
          return [];
        }
      });

      const allSubmissionsArrays = await Promise.all(allSubmissionsPromises);
      
      // Count all ungraded submissions across all assignments
      allSubmissionsArrays.forEach((submissions) => {
        const ungradedCount = submissions.filter(
          (sub) => sub.grade === null || sub.grade === undefined
        ).length;
        pendingCount += ungradedCount;
      });

      // Use cached submission data for recent assignments (no duplicate API calls)
      const assignmentsWithSubmissions = sortedAssignments.map((assignment) => {
        const submissions = submissionsMap.get(assignment.id) || [];
        const classItem = classMap.get(assignment.classId);
        return {
          id: assignment.id,
          title: assignment.title,
          class: assignment.className,
          dueDate: new Date(assignment.dueDate).toLocaleDateString(),
          submissions: submissions.length,
          total: classItem?.students || 0,
        };
      });

      setStats({
        totalClasses,
        totalStudents,
        pendingAssignments: pendingCount,
      });

      setRecentAssignments(assignmentsWithSubmissions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {teacherName}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Classes"
              value={isLoading ? "..." : stats.totalClasses}
              icon={BookOpen}
              description="Active courses"
            />
            <StatCard
              title="Total Students"
              value={isLoading ? "..." : stats.totalStudents}
              icon={Users}
              description="Enrolled students"
            />
            <StatCard
              title="Pending Assignments"
              value={isLoading ? "..." : stats.pendingAssignments}
              icon={FileText}
              description="Awaiting review"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Recent Notifications</h2>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentAssignments.length > 0 ? (
                  recentAssignments
                    .filter((assignment) => assignment.submissions > 0)
                    .slice(0, 3)
                    .map((assignment, index) => (
                      <div key={assignment.id || index} className="p-3 bg-secondary rounded-lg border border-border">
                        <p className="text-sm text-foreground">
                          {assignment.submissions} new submission{assignment.submissions !== 1 ? 's' : ''} for "{assignment.title}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Class: {assignment.class}</p>
                      </div>
                    ))
                ) : (
                  <div className="p-3 bg-secondary rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">No notifications at this time</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate("/teacher/classes")}
                  className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Create Class</p>
                </button>
                <button 
                  onClick={() => navigate("/teacher/notes")}
                  className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Upload Notes</p>
                </button>
                <button 
                  onClick={() => navigate("/teacher/assignments")}
                  className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">New Assignment</p>
                </button>
                <button 
                  onClick={() => navigate("/teacher/grades")}
                  className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Grade Work</p>
                </button>
              </div>
            </Card>
          </div>

          {/* Recent Assignments */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Assignments</h2>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : recentAssignments.length > 0 ? (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-medium text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {assignment.submissions}/{assignment.total} submitted
                      </p>
                      <p className="text-xs text-muted-foreground">Due: {assignment.dueDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No assignments found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
