import { useState } from "react";
import { BookOpen, Users, FileText, Save } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { teacherData } from "@/data/mockData";
import { toast } from "sonner";

const teacherNavItems = [
  { title: "Dashboard", path: "/teacher/dashboard", icon: BookOpen },
  { title: "Classes", path: "/teacher/classes", icon: Users },
  { title: "Notes", path: "/teacher/notes", icon: FileText },
  { title: "Assignments", path: "/teacher/assignments", icon: FileText },
  { title: "Grades", path: "/teacher/grades", icon: FileText },
  { title: "Profile", path: "/teacher/profile", icon: Users },
];

const Grades = () => {
  const [grades, setGrades] = useState<{ [key: number]: string }>({});

  const handleGradeChange = (id: number, value: string) => {
    setGrades({ ...grades, [id]: value });
  };

  const handleSave = (id: number) => {
    toast.success("Grade saved successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade Submissions</h1>
            <p className="text-muted-foreground mt-1">Review and grade student work</p>
          </div>

          {/* Submissions Table */}
          <Card className="p-6 shadow-card">
            <div className="space-y-4">
              {teacherData.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{submission.studentName}</h3>
                    <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {submission.submittedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      View File
                    </Button>
                    
                    {submission.grade !== null ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        Grade: {submission.grade}
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade"
                          className="w-20"
                          value={grades[submission.id] || ""}
                          onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSave(submission.id)}
                          disabled={!grades[submission.id]}
                          className="gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    )}
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
