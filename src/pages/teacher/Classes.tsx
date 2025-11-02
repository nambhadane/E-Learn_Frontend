import { useState, useEffect } from "react";
import { BookOpen, Users, FileText, Plus, Settings, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, Class } from "@/lib/api/classApi";
import { useToast } from "@/hooks/use-toast";
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
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const teacherName = teacher?.name || teacher?.username || "Teacher";
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
  });

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classApi.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        // If no classes or error, show empty state
        setClasses([]);
        if (response.error) {
          toast.error("Failed to load classes: " + response.error);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await classApi.createClass({
        name: formData.name,
        subject: formData.subject,
        description: formData.description,
      });

      if (response.success) {
        toast.success("Class created successfully!");
        setOpen(false);
        setFormData({ name: "", subject: "", description: "" });
        // Refresh the classes list
        await fetchClasses();
      } else {
        toast.error(response.error || "Failed to create class");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (classItem: Class) => {
    setSelectedClass(classItem);
    setViewDialogOpen(true);
  };

  const handleManage = (classItem: Class) => {
    // Navigate to assignments page with class context
    // For now, just navigate to assignments (you can pass classId as query param later)
    navigate("/teacher/assignments");
    toast.info(`Managing class: ${classItem.name}`);
  };

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete || !classToDelete.id) {
      toast.error("Cannot delete class: Invalid class ID");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await classApi.deleteClass(classToDelete.id);

      if (response.success) {
        toast.success(`Class "${classToDelete.name}" deleted successfully!`);
        setDeleteDialogOpen(false);
        setClassToDelete(null);
        // Close view dialog if it's open for the deleted class
        if (selectedClass?.id === classToDelete.id) {
          setViewDialogOpen(false);
          setSelectedClass(null);
        }
        // Refresh the classes list
        await fetchClasses();
      } else {
        toast.error(response.error || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherName} />
      
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Class"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && classes.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Classes Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first class to get started teaching!
              </p>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Class
              </Button>
            </Card>
          )}

          {/* Classes Grid */}
          {!isLoading && classes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02]">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {classItem.students !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">{classItem.students}</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(classItem);
                          }}
                          title="Delete class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">{classItem.subject}</p>
                    </div>

                    {classItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {classItem.description}
                      </p>
                    )}

                    <div className="pt-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleManage(classItem)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleView(classItem)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* View Class Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Class Details</DialogTitle>
                <DialogDescription>
                  View detailed information about this class
                </DialogDescription>
              </DialogHeader>
              {selectedClass && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">
                          {selectedClass.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {selectedClass.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-foreground mt-1">
                        {selectedClass.description || "No description provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Class ID</Label>
                        <p className="text-foreground font-medium mt-1">#{selectedClass.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Enrolled Students</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground font-medium">
                            {selectedClass.students || 0} students
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleDeleteClick(selectedClass);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setViewDialogOpen(false);
                      handleManage(selectedClass);
                    }}>
                      Manage Class
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Delete Class</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this class? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {classToDelete && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-destructive/20 rounded-lg">
                        <BookOpen className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{classToDelete.name}</h3>
                        <p className="text-sm text-muted-foreground">{classToDelete.subject}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Warning:</strong> All assignments, notes, and student enrollments associated with this class will also be deleted.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setClassToDelete(null);
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Class
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Classes;
