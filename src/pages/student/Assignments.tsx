import { BookOpen, FileText, Trophy, Bell, Upload, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studentData } from "@/data/mockData";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; className: string; text: string }> = {
    pending: { variant: "outline", className: "bg-warning/10 text-warning border-warning", text: "Pending" },
    submitted: { variant: "outline", className: "bg-primary/10 text-primary border-primary", text: "Submitted" },
    graded: { variant: "outline", className: "bg-success/10 text-success border-success", text: "Graded" },
  };
  
  const config = variants[status] || variants.pending;
  return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
};

const Assignments = () => {
  const handleUpload = () => {
    toast.success("Assignment submitted successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">View and submit your assignments</p>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {studentData.assignments.map((assignment) => (
              <Card key={assignment.id} className="p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Due Date: {assignment.dueDate}</p>
                      {assignment.submittedDate && (
                        <p className="text-muted-foreground">Submitted: {assignment.submittedDate}</p>
                      )}
                      {assignment.grade !== null && (
                        <p className="font-semibold text-success">Grade: {assignment.grade}/100</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {assignment.status === "pending" && (
                        <Button onClick={handleUpload} className="gap-2">
                          <Upload className="h-4 w-4" />
                          Submit Assignment
                        </Button>
                      )}
                      {assignment.status === "submitted" && (
                        <Button variant="outline" disabled>
                          Awaiting Review
                        </Button>
                      )}
                      {assignment.status === "graded" && (
                        <Button variant="outline">
                          View Feedback
                        </Button>
                      )}
                    </div>
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

export default Assignments;
