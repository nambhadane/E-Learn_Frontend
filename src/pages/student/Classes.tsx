import { BookOpen, FileText, Trophy, Bell, Calendar, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { studentData } from "@/data/mockData";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const Classes = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
            <p className="text-muted-foreground mt-1">View your enrolled courses</p>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentData.classes.map((classItem) => (
              <Card key={classItem.id} className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02]">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">{classItem.schedule}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {classItem.teacher}
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Notes
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Classes;
