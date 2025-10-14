import { BookOpen, FileText, Trophy, Bell, User, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studentData } from "@/data/mockData";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const getNotificationIcon = (type: string) => {
  const icons = {
    assignment: FileText,
    grade: Trophy,
    notes: BookOpen,
    reminder: AlertCircle,
  };
  return icons[type as keyof typeof icons] || Bell;
};

const getNotificationColor = (type: string) => {
  const colors = {
    assignment: "text-primary",
    grade: "text-success",
    notes: "text-accent",
    reminder: "text-warning",
  };
  return colors[type as keyof typeof colors] || "text-primary";
};

const Notifications = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">Stay updated with your courses</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              {studentData.notifications.length} New
            </Badge>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {studentData.notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <Card
                  key={notification.id}
                  className="p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-secondary rounded-lg ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <p className="text-foreground font-medium">{notification.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.time}</p>
                    </div>

                    <Badge variant="outline" className="capitalize">
                      {notification.type}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
