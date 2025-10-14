import { BookOpen, Users, FileText, Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teacherData } from "@/data/mockData";

const teacherNavItems = [
  { title: "Dashboard", path: "/teacher/dashboard", icon: BookOpen },
  { title: "Classes", path: "/teacher/classes", icon: Users },
  { title: "Notes", path: "/teacher/notes", icon: FileText },
  { title: "Assignments", path: "/teacher/assignments", icon: FileText },
  { title: "Grades", path: "/teacher/grades", icon: FileText },
  { title: "Profile", path: "/teacher/profile", icon: Users },
];

const TeacherDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {teacherData.name}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Classes"
              value={teacherData.stats.totalClasses}
              icon={BookOpen}
              description="Active courses"
            />
            <StatCard
              title="Total Students"
              value={teacherData.stats.totalStudents}
              icon={Users}
              description="Enrolled students"
            />
            <StatCard
              title="Pending Assignments"
              value={teacherData.stats.pendingAssignments}
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
                {teacherData.notifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-secondary rounded-lg border border-border">
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Create Class</p>
                </button>
                <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Upload Notes</p>
                </button>
                <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">New Assignment</p>
                </button>
                <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
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
              {teacherData.assignments.slice(0, 3).map((assignment) => (
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
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
