import { useState, useEffect } from "react";
import { BookOpen, FileText, Trophy, Bell, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentClassApi } from "@/lib/api/studentClassApi";
import { assignmentApi, StudentAssignment } from "@/lib/api/assignmentApi";
import { notificationApi, Notification } from "@/lib/api/notificationApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: BookOpen },
];

const StudentDashboard = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [stats, setStats] = useState({
    enrolledClasses: 0,
    pendingAssignments: 0,
    gradesReceived: 0,
  });
  const [upcomingAssignments, setUpcomingAssignments] = useState<StudentAssignment[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch enrolled classes
      const classesResponse = await studentClassApi.getMyClasses();
      const classes = classesResponse.success && classesResponse.data ? classesResponse.data : [];
      setEnrolledClasses(classes);
      setStats(prev => ({ ...prev, enrolledClasses: classes.length }));

      // Fetch assignments
      const assignmentsResponse = await assignmentApi.getStudentAssignments();
      const assignments = assignmentsResponse.success && assignmentsResponse.data ? assignmentsResponse.data : [];
      
      // Calculate stats
      const pendingCount = assignments.filter(a => a.status === 'pending').length;
      const gradedCount = assignments.filter(a => a.status === 'graded').length;
      
      setStats(prev => ({
        ...prev,
        pendingAssignments: pendingCount,
        gradesReceived: gradedCount,
      }));

      // Get upcoming assignments (pending, sorted by due date)
      const pending = assignments
        .filter(a => a.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);
      
      setUpcomingAssignments(pending);

      // Fetch recent notifications
      const notificationsResponse = await notificationApi.getStudentNotifications();
      if (notificationsResponse.success && notificationsResponse.data) {
        // Get read status
        const readIds = notificationApi.getReadNotificationIds();
        const notificationsWithRead = notificationsResponse.data.map(notif => ({
          ...notif,
          read: readIds.includes(notif.id),
        }));
        // Get top 5 most recent notifications
        setRecentNotifications(notificationsWithRead.slice(0, 5));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      assignment: FileText,
      grade: Trophy,
      notes: BookOpen,
      deadline: AlertCircle,
      reminder: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return timestamp;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {studentName}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Enrolled Classes"
              value={isLoading ? "..." : stats.enrolledClasses}
              icon={BookOpen}
              description="Active courses"
            />
            <StatCard
              title="Pending Assignments"
              value={isLoading ? "..." : stats.pendingAssignments}
              icon={FileText}
              description="To be submitted"
            />
            <StatCard
              title="Grades Received"
              value={isLoading ? "..." : stats.gradesReceived}
              icon={Trophy}
              description="Completed work"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Upcoming Assignments</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/student/assignments")}
                  className="text-sm"
                >
                  View All
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-3 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors cursor-pointer" onClick={() => navigate("/student/assignments")}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.className || `Class ${assignment.courseId}`}</p>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Notifications */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Recent Notifications</h2>
                  {recentNotifications.filter(n => !n.read).length > 0 && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary ml-2">
                      {recentNotifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/student/notifications")}
                  className="text-sm"
                >
                  View All
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors cursor-pointer ${
                          !notification.read ? 'border-l-4 border-l-primary' : ''
                        }`}
                        onClick={() => {
                          // Mark as read
                          if (!notification.read) {
                            notificationApi.markAsRead(notification.id);
                            setRecentNotifications(prev =>
                              prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                            );
                          }
                          // Navigate based on type
                          if (notification.relatedType === 'assignment' || notification.type === 'deadline') {
                            navigate("/student/assignments");
                          } else if (notification.relatedType === 'submission' || notification.type === 'grade') {
                            navigate("/student/grades");
                          } else {
                            navigate("/student/notifications");
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-background rounded-lg ${notification.type === 'grade' ? 'text-success' : notification.type === 'deadline' ? 'text-warning' : 'text-primary'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Enrolled Classes */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">My Classes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/classes")}
                className="text-sm"
              >
                View All
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : enrolledClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No classes enrolled yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledClasses.slice(0, 4).map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate("/student/classes")}
                  >
                    <h3 className="font-semibold text-foreground">{classItem.name}</h3>
                    {classItem.teacherName && (
                      <p className="text-sm text-muted-foreground">{classItem.teacherName}</p>
                    )}
                    {classItem.subject && (
                      <p className="text-xs text-muted-foreground mt-1">{classItem.subject}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
