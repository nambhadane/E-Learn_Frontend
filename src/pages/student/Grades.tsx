import { useState, useEffect } from "react";
import { BookOpen, FileText, Trophy, Bell, User, Calendar, Filter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { assignmentApi, StudentAssignment } from "@/lib/api/assignmentApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const Grades = () => {
  const { student } = useStudentAuth();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [allAssignments, setAllAssignments] = useState<StudentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      const response = await assignmentApi.getStudentAssignments();
      
      if (response.success && response.data) {
        setAllAssignments(response.data);
      } else {
        toast.error(response.error || "Failed to load grades");
        setAllAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades. Please try again.");
      setAllAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter graded assignments
  const gradedAssignments = allAssignments.filter((a) => a.status === 'graded' && a.grade !== null && a.grade !== undefined);

  // Get unique classes
  const classes = Array.from(new Set(gradedAssignments.map(a => a.className).filter(Boolean)));

  // Filter by selected class
  const filteredGrades = selectedClass === "all" 
    ? gradedAssignments 
    : gradedAssignments.filter(a => a.className === selectedClass);

  // Sort grades
  const sortedGrades = [...filteredGrades].sort((a, b) => {
    if (sortBy === "date" && a.submittedAt && b.submittedAt) {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    } else if (sortBy === "grade" && a.grade !== null && b.grade !== null) {
      return (b.grade || 0) - (a.grade || 0);
    } else if (sortBy === "class") {
      return (a.className || '').localeCompare(b.className || '');
    }
    return 0;
  });

  // Calculate statistics
  const averageGrade = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length
    : 0;

  const highestGrade = gradedAssignments.length > 0
    ? Math.max(...gradedAssignments.map(a => a.grade || 0))
    : 0;

  const lowestGrade = gradedAssignments.length > 0
    ? Math.min(...gradedAssignments.map(a => a.grade || 0))
    : 0;

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-primary";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  const getGradeBadge = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return { text: "Excellent", className: "bg-success/10 text-success border-success" };
    if (percentage >= 80) return { text: "Good", className: "bg-primary/10 text-primary border-primary" };
    if (percentage >= 70) return { text: "Satisfactory", className: "bg-warning/10 text-warning border-warning" };
    return { text: "Needs Improvement", className: "bg-destructive/10 text-destructive border-destructive" };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Grades</h1>
            <p className="text-muted-foreground mt-1">Track your academic performance</p>
          </div>

          {/* Statistics Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : gradedAssignments.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Grades Yet</h3>
              <p className="text-muted-foreground">
                You haven't received any grades yet. Submit your assignments to get graded.
              </p>
            </Card>
          ) : (
            <>
              {/* Overall Performance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 shadow-card">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{averageGrade.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground mt-1">Average Grade</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gradedAssignments.length} graded assignment{gradedAssignments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success">{highestGrade.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground mt-1">Highest Grade</p>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-warning">{lowestGrade.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground mt-1">Lowest Grade</p>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{classes.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Classes</p>
                    <p className="text-xs text-muted-foreground mt-1">with grades</p>
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <Card className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date (Newest)</SelectItem>
                      <SelectItem value="grade">Grade (Highest)</SelectItem>
                      <SelectItem value="class">Class Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Grades List */}
              <Card className="p-6 shadow-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Grade History</h2>
                <div className="space-y-4">
                  {sortedGrades.map((assignment) => {
                    const maxGrade = assignment.maxGrade || 100;
                    const grade = assignment.grade || 0;
                    const badge = getGradeBadge(grade, maxGrade);
                    
                    return (
                      <div
                        key={assignment.id}
                        className="p-4 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                              <Badge variant="outline" className={badge.className}>
                                {badge.text}
                              </Badge>
                            </div>
                            
                            {assignment.className && (
                              <p className="text-sm text-muted-foreground mb-1">
                                {assignment.className}
                              </p>
                            )}
                            
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              {assignment.submittedAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Submitted: {formatDate(assignment.submittedAt)}</span>
                                </div>
                              )}
                            </div>

                            {assignment.feedback && (
                              <div className="mt-3 p-3 bg-background rounded border border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Teacher Feedback:</p>
                                <p className="text-sm text-foreground">{assignment.feedback}</p>
                              </div>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className={`text-3xl font-bold ${getGradeColor(grade, maxGrade)}`}>
                              {grade.toFixed(1)}
                            </div>
                            <p className="text-sm text-muted-foreground">out of {maxGrade}</p>
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {((grade / maxGrade) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Grades;
