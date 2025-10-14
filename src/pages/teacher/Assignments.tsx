import { useState } from "react";
import { BookOpen, Users, FileText, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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

const Assignments = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    description: "",
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Assignment created successfully!");
    setOpen(false);
    setFormData({ title: "", class: "", description: "", dueDate: "" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
              <p className="text-muted-foreground mt-1">Create and manage assignments</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Implement Binary Search"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Select Class</Label>
                    <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherData.classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.name}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Assignment instructions and requirements"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Assignment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {teacherData.assignments.map((assignment) => {
              const progressPercent = (assignment.submissions / assignment.total) * 100;
              return (
                <Card key={assignment.id} className="p-6 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{assignment.class}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">Due: {assignment.dueDate}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Submission Progress</span>
                        <span className="font-medium text-foreground">
                          {assignment.submissions}/{assignment.total} students
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        View Submissions
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
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

export default Assignments;
