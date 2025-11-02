import { useState, useEffect } from "react";
import { BookOpen, FileText, File, Download, Eye } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentClassApi, StudentClass } from "@/lib/api/studentClassApi";
import { notesApi, LessonDTO } from "@/lib/api/notesApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Notes", path: "/student/notes", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: FileText },
  { title: "Notifications", path: "/student/notifications", icon: BookOpen },
  { title: "Profile", path: "/student/profile", icon: BookOpen },
];

const Notes = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");
  
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get classId from URL query params
  useEffect(() => {
    const classIdParam = searchParams.get('classId');
    if (classIdParam) {
      const classId = parseInt(classIdParam);
      if (!isNaN(classId)) {
        setSelectedClassId(classId);
      }
    }
  }, [searchParams]);

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
      const response = await studentClassApi.getMyClasses();
      if (response.success && response.data) {
        setClasses(response.data);
        // Auto-select first class if available and no classId in URL
        const classIdParam = searchParams.get('classId');
        if (!classIdParam && response.data.length > 0 && !selectedClassId) {
          const firstClass = response.data[0];
          if (firstClass.id) {
            setSelectedClassId(firstClass.id);
          }
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
      const response = await notesApi.getLessonsByClassForStudent(classId);
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
      const token = localStorage.getItem('studentAuthToken') || localStorage.getItem('authToken');
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Open view endpoint in new window
      const viewUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}/lessons/${lesson.id}/view`;
      
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
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Course Notes</h1>
            <p className="text-muted-foreground mt-1">View and download study materials for your classes</p>
          </div>

          {/* Class Filter */}
          {classes.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Filter by Class:</Label>
                <Select 
                  value={selectedClassId?.toString() || ""} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedClassId(null);
                      navigate('/student/notes');
                    } else {
                      const classId = parseInt(value);
                      if (!isNaN(classId)) {
                        setSelectedClassId(classId);
                        navigate(`/student/notes?classId=${classId}`);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id?.toString() || ""}>
                        {classItem.name} {classItem.subject ? `- ${classItem.subject}` : ''}
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
                <h3 className="text-xl font-semibold text-foreground mb-2">No Notes Available</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedClassId 
                    ? "No notes have been uploaded for this class yet." 
                    : "Select a class to view available notes"}
                </p>
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

