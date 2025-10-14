import { useState } from "react";
import { BookOpen, Users, FileText, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const Classes = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Class created successfully!");
    setOpen(false);
    setFormData({ name: "", subject: "", description: "" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
              <p className="text-muted-foreground mt-1">Manage your courses and students</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Data Structures"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the course"
                      rows={3}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Class</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherData.classes.map((classItem) => (
              <Card key={classItem.id} className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{classItem.students}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">{classItem.subject}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Manage
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View
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
