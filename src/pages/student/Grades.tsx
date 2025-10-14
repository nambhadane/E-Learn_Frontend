import { BookOpen, FileText, Trophy, Bell, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { studentData } from "@/data/mockData";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const Grades = () => {
  const gradedAssignments = studentData.assignments.filter((a) => a.grade !== null);
  const averageGrade =
    gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Grades</h1>
            <p className="text-muted-foreground mt-1">Track your academic performance</p>
          </div>

          {/* Overall Performance */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Overall Performance</h2>
                <p className="text-muted-foreground">Based on {gradedAssignments.length} graded assignments</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{averageGrade.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
              </div>
            </div>
          </Card>

          {/* Grades Table */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Grade History</h2>
            <div className="space-y-3">
              {gradedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.class}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {assignment.submittedDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{assignment.grade}</div>
                    <p className="text-sm text-muted-foreground">out of 100</p>
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

export default Grades;
