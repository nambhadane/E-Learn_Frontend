import { useState, useEffect } from "react";
import { BookOpen, Users, FileText, Upload, File, Download, Trash2, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, Class } from "@/lib/api/classApi";
import { notesApi, LessonDTO } from "@/lib/api/notesApi";
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
  const { teacher } = useAuth();
  const teacherName = teacher?.name || teacher?.username || "Teacher";
  
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    file: null as File | null,
  });

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch lessons when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchLessons(selectedClassId);
    } else {
      setLessons([]);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classApi.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
        // Auto-select first class if available
        if (response.data.length > 0 && !selectedClassId) {
          setSelectedClassId(response.data[0].id!);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async (classId: number) => {
    try {
      const response = await notesApi.getLessonsByClass(classId);
      if (response.success && response.data) {
        setLessons(response.data);
      } else {
        setLessons([]);
        if (response.error) {
          toast.error("Failed to load notes: " + response.error);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load notes");
      setLessons([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classId || !formData.title || !formData.file) {
      toast.error("Please fill in all fields and select a file");
      return;
    }

    setIsUploading(true);
    try {
      const response = await notesApi.uploadLesson({
        classId: parseInt(formData.classId),
        title: formData.title,
        file: formData.file,
      });

      if (response.success) {
        toast.success("Notes uploaded successfully!");
        setOpen(false);
        setFormData({ title: "", classId: "", file: null });
        // Refresh lessons list
        if (selectedClassId) {
          await fetchLessons(selectedClassId);
        }
      } else {
        toast.error(response.error || "Failed to upload notes");
      }
    } catch (error) {
      console.error("Error uploading notes:", error);
      toast.error("Failed to upload notes. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (lesson: LessonDTO) => {
    try {
      // Extract filename from filePath
      const filename = lesson.filePath ? lesson.filePath.split('/').pop() || lesson.title : lesson.title;
      
      const result = await notesApi.downloadLesson(lesson.id, filename);
      
      if (result.success) {
        toast.success("File downloaded successfully!");
      } else {
        toast.error(result.error || "Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  const handleView = async (lesson: LessonDTO) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Open view endpoint in new window
      const viewUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/lessons/${lesson.id}/view`;
      
      // Create a form to submit with token (for viewing in browser)
      // Since we can't send headers in window.open, we'll use download but open in new tab
      // Better approach: fetch the blob and create object URL
      const response = await fetch(viewUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to load file' }));
        toast.error(error.message || "Failed to view file");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Check if it's a PDF or image that can be viewed in browser
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('pdf') || contentType.includes('image') || contentType.includes('text')) {
        window.open(url, '_blank');
      } else {
        // For other file types, download instead
        const a = document.createElement('a');
        a.href = url;
        a.download = lesson.filePath.split('/').pop() || lesson.title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.info("File downloaded (cannot preview this file type in browser)");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Failed to view file. Please try again.");
    }
  };

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toUpperCase() || 'FILE';
    return extension;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherName} />
      
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
                      disabled={isUploading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Select Class</Label>
                    <Select 
                      value={formData.classId} 
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                      disabled={isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id?.toString() || ""}>
                            {classItem.name} - {classItem.subject}
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
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      required
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PDF, PPT, PPTX, DOC, DOCX, TXT
                    </p>
                    {formData.file && (
                      <p className="text-sm text-foreground mt-1">
                        Selected: <span className="font-medium">{formData.file.name}</span>
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      "Upload Notes"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Class Filter */}
          {classes.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Filter by Class:</Label>
                <Select 
                  value={selectedClassId?.toString() || ""} 
                  onValueChange={(value) => setSelectedClassId(parseInt(value))}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id?.toString() || ""}>
                        {classItem.name} - {classItem.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}

          {/* Notes List */}
          <Card className="p-6 shadow-card">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Notes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedClassId 
                    ? "Upload your first note for this class to get started!" 
                    : "Select a class to view notes or upload new ones"}
                </p>
                {selectedClassId && (
                  <Button onClick={() => setOpen(true)} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Your First Note
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const fileName = lesson.filePath ? lesson.filePath.split('/').pop() : 'No file';
                  const fileIcon = getFileIcon(lesson.filePath || '');
                  const fileType = getFileType(lesson.filePath || '');
                  
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg text-2xl">
                          {fileIcon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">{fileName}</p>
                            <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
                              {fileType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(lesson)}
                          title="View file in browser"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(lesson)}
                          title="Download file"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notes;
