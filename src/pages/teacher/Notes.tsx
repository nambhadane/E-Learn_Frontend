import { useState } from "react";
import { BookOpen, Users, FileText, Upload, File } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const Notes = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notes uploaded successfully!");
    setOpen(false);
    setFormData({ title: "", class: "" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Course Notes</h1>
              <p className="text-muted-foreground mt-1">Upload and manage study materials</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Notes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Course Notes</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Note Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Introduction to Linked Lists"
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
                    <Label htmlFor="file">Upload File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PDF, PPT, DOC
                    </p>
                  </div>
                  <Button type="submit" className="w-full">Upload Notes</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Notes List */}
          <Card className="p-6 shadow-card">
            <div className="space-y-4">
              {teacherData.notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <File className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{note.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {note.class} • {note.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{note.date}</span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
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

export default Notes;
