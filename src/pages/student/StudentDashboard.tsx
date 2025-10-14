import { BookOpen, FileText, Trophy, Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studentData } from "@/data/mockData";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: BookOpen },
];

const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {studentData.name}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Enrolled Classes"
              value={studentData.stats.enrolledClasses}
              icon={BookOpen}
              description="Active courses"
            />
            <StatCard
              title="Pending Assignments"
              value={studentData.stats.pendingAssignments}
              icon={FileText}
              description="To be submitted"
            />
            <StatCard
              title="Grades Received"
              value={studentData.stats.gradesReceived}
              icon={Trophy}
              description="Completed work"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Upcoming Assignments</h2>
              </div>
              <div className="space-y-3">
                {studentData.assignments
                  .filter((a) => a.status === "pending")
                  .slice(0, 3)
                  .map((assignment) => (
                    <div key={assignment.id} className="p-3 bg-secondary rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.class}</p>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Due: {assignment.dueDate}</p>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Recent Notifications */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Recent Notifications</h2>
              </div>
              <div className="space-y-3">
                {studentData.notifications.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="p-3 bg-secondary rounded-lg border border-border">
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Enrolled Classes */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">My Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentData.classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-semibold text-foreground">{classItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{classItem.teacher}</p>
                  <p className="text-xs text-muted-foreground mt-1">{classItem.schedule}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
