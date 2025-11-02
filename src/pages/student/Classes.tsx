import { useState, useEffect } from "react";
import { BookOpen, FileText, Trophy, Bell, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentClassApi, StudentClass } from "@/lib/api/studentClassApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const Classes = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await studentClassApi.getMyClasses();
      
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast.error(response.error || "Failed to load classes");
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes. Please try again.");
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNotes = (classId: number) => {
    // Navigate to notes page filtered by class
    navigate(`/student/notes?classId=${classId}`);
  };

  const handleViewDetails = (classId: number) => {
    // Navigate to class details or assignments for this class
    navigate(`/student/assignments?classId=${classId}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
            <p className="text-muted-foreground mt-1">View your enrolled courses</p>
          </div>

          {/* Classes Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02]">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      {classItem.schedule && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">{classItem.schedule}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {classItem.name}
                      </h3>
                      {(classItem.teacherName || classItem.teacher) && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {classItem.teacherName || classItem.teacher}
                        </p>
                      )}
                      {classItem.subject && (
                        <p className="text-xs text-muted-foreground mt-1">{classItem.subject}</p>
                      )}
                    </div>

                    {classItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {classItem.description}
                      </p>
                    )}

                    <div className="pt-2 flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => classItem.id && handleViewDetails(classItem.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => classItem.id && handleViewNotes(classItem.id)}
                      >
                        View Notes
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Classes Enrolled</h3>
                  <p className="text-muted-foreground">
                    You haven't enrolled in any classes yet. Contact your teacher to get enrolled.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Classes;
