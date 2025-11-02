import { useState, useEffect } from "react";
import { BookOpen, FileText, Trophy, Bell, Upload, User, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { assignmentApi, StudentAssignment, SubmitAssignmentRequest } from "@/lib/api/assignmentApi";
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
  const { student } = useStudentAuth();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await assignmentApi.getStudentAssignments();
      
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        toast.error(response.error || "Failed to load assignments");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments. Please try again.");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClick = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
    setSubmissionContent("");
    setSubmissionFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Limit to 10 files
      if (fileArray.length > 10) {
        toast.error("Maximum 10 files allowed");
        setSubmissionFiles(fileArray.slice(0, 10));
      } else {
        setSubmissionFiles(fileArray);
      }
    }
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !selectedAssignment.id) {
      toast.error("Invalid assignment");
      return;
    }

    if (!submissionContent.trim() && submissionFiles.length === 0) {
      toast.error("Please enter submission content or attach files");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await assignmentApi.submitAssignment(
        selectedAssignment.id,
        submissionContent.trim() || undefined,
        submissionFiles
      );

      if (response.success) {
        toast.success("Assignment submitted successfully!");
        setSubmitDialogOpen(false);
        setSelectedAssignment(null);
        setSubmissionContent("");
        setSubmissionFiles([]);
        // Refresh assignments list
        await fetchAssignments();
      } else {
        toast.error(response.error || "Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate: string, status?: string) => {
    if (status === "submitted" || status === "graded") return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      return now > due;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">View and submit your assignments from enrolled classes</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && assignments.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Assignments</h3>
              <p className="text-muted-foreground">
                You don't have any assignments from your enrolled classes yet.
              </p>
            </Card>
          )}

          {/* Assignments List */}
          {!isLoading && assignments.length > 0 && (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="p-6 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-foreground">
                            {assignment.title}
                          </h3>
                          {getStatusBadge(assignment.status || "pending")}
                          {isOverdue(assignment.dueDate, assignment.status) && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-primary font-medium mb-1">
                          {assignment.className || `Class ID: ${assignment.courseId}`}
                        </p>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm flex-wrap gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        {assignment.submittedAt && (
                          <p className="text-muted-foreground">
                            Submitted: {formatDate(assignment.submittedAt)}
                          </p>
                        )}
                        {assignment.grade !== null && assignment.grade !== undefined && (
                          <p className="font-semibold text-success">
                            Grade: {assignment.grade}/{assignment.maxGrade}
                          </p>
                        )}
                        {assignment.feedback && (
                          <p className="text-muted-foreground mt-2">
                            Feedback: {assignment.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {assignment.status === "pending" && (
                          <Button onClick={() => handleSubmitClick(assignment)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Submit Assignment
                          </Button>
                        )}
                        {assignment.status === "submitted" && (
                          <Button variant="outline" disabled>
                            Awaiting Review
                          </Button>
                        )}
                        {assignment.status === "graded" && assignment.feedback && (
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
          )}

          {/* Submit Assignment Dialog */}
          <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Submit Assignment</DialogTitle>
                <DialogDescription>
                  Submit your work for: {selectedAssignment?.title}
                </DialogDescription>
              </DialogHeader>
              
              {selectedAssignment && (
                <form onSubmit={handleSubmitAssignment} className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="submissionContent">Your Submission</Label>
                      <Textarea
                        id="submissionContent"
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        placeholder="Enter your assignment content here..."
                        rows={8}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        You can enter text content and/or attach files
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submissionFiles">Attach Files (Optional)</Label>
                      <input
                        id="submissionFiles"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, PNG (Max 10 files)
                      </p>
                      
                      {submissionFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm font-medium">Selected files:</p>
                          <div className="space-y-1">
                            {submissionFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                                <span className="text-foreground truncate flex-1">{file.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={isSubmitting}
                                  className="ml-2 h-6 w-6 p-0"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(selectedAssignment.dueDate)}
                      </p>
                      {isOverdue(selectedAssignment.dueDate) && (
                        <p className="text-xs text-destructive">
                          ⚠️ This assignment is overdue
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSubmitDialogOpen(false);
                        setSubmissionContent("");
                        setSubmissionFiles([]);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || (!submissionContent.trim() && submissionFiles.length === 0)}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Assignments;
