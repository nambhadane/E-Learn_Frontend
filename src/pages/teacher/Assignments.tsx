import { useState, useEffect } from "react";
import { BookOpen, Users, FileText, Plus, Calendar, FileCheck, Eye, ListChecks, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, Class } from "@/lib/api/classApi";
import { assignmentApi, AssignmentDTO, SubmissionDTO } from "@/lib/api/assignmentApi";
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
  const { teacher } = useAuth();
  const teacherName = teacher?.name || teacher?.username || "Teacher";
  
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentDTO | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDTO | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionDTO | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    description: "",
    dueDateTime: "",
    maxGrade: "",
  });

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch assignments when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchAssignments(selectedClassId);
    } else {
      setAssignments([]);
    }
  }, [selectedClassId]);

  // Clear submissions when dialog closes
  useEffect(() => {
    if (!submissionsOpen) {
      setSubmissions([]);
      setGradingSubmission(null);
      setGradeForm({ grade: "", feedback: "" });
    }
  }, [submissionsOpen]);

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

  const fetchAssignments = async (classId: number) => {
    try {
      const response = await assignmentApi.getAssignmentsByClass(classId);
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        setAssignments([]);
        if (response.error) {
          toast.error("Failed to load assignments: " + response.error);
        }
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
      setAssignments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classId || !formData.title || !formData.description || !formData.dueDateTime || !formData.maxGrade) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO format
      const dueDateTime = new Date(formData.dueDateTime).toISOString();

      const response = await assignmentApi.createAssignment({
        title: formData.title,
        description: formData.description,
        dueDate: dueDateTime,
        maxGrade: parseFloat(formData.maxGrade),
        courseId: parseInt(formData.classId),
      });

      if (response.success) {
        toast.success("Assignment created successfully!");
        setOpen(false);
        setFormData({ title: "", classId: "", description: "", dueDateTime: "", maxGrade: "" });
        // Refresh assignments list
        if (selectedClassId) {
          await fetchAssignments(selectedClassId);
        }
      } else {
        toast.error(response.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (assignment: AssignmentDTO) => {
    setSelectedAssignment(assignment);
    setDetailsOpen(true);
  };

  const handleViewSubmissions = async (assignment: AssignmentDTO) => {
    if (!assignment.id) {
      toast.error("Invalid assignment ID");
      return;
    }
    setSelectedAssignment(assignment);
    setSubmissions([]); // Clear previous submissions
    setSubmissionsOpen(true);
    await fetchSubmissions(assignment.id);
  };

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      setIsLoadingSubmissions(true);
      console.log("Fetching submissions for assignment ID:", assignmentId);
      const response = await assignmentApi.getSubmissionsByAssignment(assignmentId);
      console.log("Submissions API response:", response);
      
      if (response.success && response.data) {
        console.log("Setting submissions:", response.data);
        setSubmissions(response.data);
      } else {
        console.log("No submissions or error:", response.error);
        setSubmissions([]);
        if (response.error) {
          toast.error("Failed to load submissions: " + response.error);
        } else {
          // No error but no data - just empty list (normal case)
          console.log("No submissions found for this assignment");
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradeClick = (submission: SubmissionDTO) => {
    setGradingSubmission(submission);
    setGradeForm({
      grade: submission.grade?.toString() || "",
      feedback: submission.feedback || "",
    });
  };

  const handleGradeSubmit = async () => {
    if (!gradingSubmission || !gradingSubmission.id) {
      toast.error("Invalid submission");
      return;
    }

    const gradeValue = parseFloat(gradeForm.grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      toast.error("Grade must be a number between 0 and 100");
      return;
    }

    try {
      const response = await assignmentApi.gradeSubmission(gradingSubmission.id, {
        grade: gradeValue,
        feedback: gradeForm.feedback,
      });

      if (response.success && response.data) {
        toast.success("Submission graded successfully!");
        // Update submissions list
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === gradingSubmission.id ? response.data! : sub
          )
        );
        setGradingSubmission(null);
        setGradeForm({ grade: "", feedback: "" });
      } else {
        toast.error(response.error || "Failed to grade submission");
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission. Please try again.");
    }
  };

  const handleDeleteClick = (assignment: AssignmentDTO) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete || !assignmentToDelete.id) {
      toast.error("Cannot delete assignment: Invalid assignment ID");
      return;
    }

    try {
      const response = await assignmentApi.deleteAssignment(assignmentToDelete.id);
      
      if (response.success) {
        toast.success(`Assignment "${assignmentToDelete.title}" deleted successfully!`);
        setDeleteDialogOpen(false);
        setAssignmentToDelete(null);
        // Close details dialog if it's open for the deleted assignment
        if (selectedAssignment?.id === assignmentToDelete.id) {
          setDetailsOpen(false);
          setSelectedAssignment(null);
        }
        // Refresh assignments list
        if (selectedClassId) {
          await fetchAssignments(selectedClassId);
        }
      } else {
        toast.error(response.error || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
                    <Select 
                      value={formData.classId} 
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                      disabled={isSubmitting}
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Assignment instructions and requirements"
                      rows={3}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDateTime">Due Date & Time</Label>
                    <Input
                      id="dueDateTime"
                      type="datetime-local"
                      value={formData.dueDateTime}
                      onChange={(e) => setFormData({ ...formData, dueDateTime: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGrade">Maximum Grade</Label>
                    <Input
                      id="maxGrade"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxGrade}
                      onChange={(e) => setFormData({ ...formData, maxGrade: e.target.value })}
                      placeholder="e.g., 100"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Assignment"
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

          {/* Assignments List */}
          <Card className="p-6 shadow-card">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Assignments Yet</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedClassId 
                    ? "Create your first assignment for this class!" 
                    : "Select a class to view assignments or create new ones"}
                </p>
                {selectedClassId && (
                  <Button onClick={() => setOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Assignment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isOverdue = new Date(assignment.dueDate) < new Date();
                  return (
                    <Card key={assignment.id} className="p-6 shadow-card hover:shadow-card-hover transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <FileCheck className="h-5 w-5 text-primary" />
                              </div>
                              <h3 className="text-xl font-semibold text-foreground">
                                {assignment.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {assignment.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Max Grade: {assignment.maxGrade}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                            {isOverdue && (
                              <span className="text-xs text-destructive">Overdue</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(assignment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSubmissions(assignment)}
                          >
                            <ListChecks className="h-4 w-4 mr-2" />
                            View Submissions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(assignment)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Assignment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              View complete information about this assignment
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Title</Label>
                <p className="text-foreground">{selectedAssignment.title}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <p className="text-foreground whitespace-pre-wrap">{selectedAssignment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Due Date & Time</Label>
                  <p className="text-foreground">{formatDate(selectedAssignment.dueDate)}</p>
                  {new Date(selectedAssignment.dueDate) < new Date() && (
                    <span className="text-xs text-destructive">Overdue</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Maximum Grade</Label>
                  <p className="text-foreground">{selectedAssignment.maxGrade}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Course ID</Label>
                <p className="text-foreground">{selectedAssignment.courseId}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assignment Submissions</DialogTitle>
            <DialogDescription>
              {selectedAssignment && `View and grade submissions for: ${selectedAssignment.title}`}
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4 mt-4">
              {isLoadingSubmissions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    No submissions yet for this assignment.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submissions will appear here when students submit their work.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''} from database
                    </p>
                  </div>
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {submission.studentName || `Student #${submission.studentId}`}
                            </h4>
                            {submission.submittedAt && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Submitted: {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                          {submission.grade !== null && submission.grade !== undefined && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                Grade: {submission.grade}/100
                              </div>
                            </div>
                          )}
                        </div>

                        {submission.content && (
                          <div className="p-3 bg-secondary rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {submission.content}
                            </p>
                          </div>
                        )}

                        {submission.filePath && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              File: {submission.filePath}
                            </span>
                          </div>
                        )}

                        {submission.feedback && (
                          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm font-medium text-foreground mb-1">Feedback:</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {submission.feedback}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeClick(submission)}
                          >
                            {submission.grade !== null && submission.grade !== undefined
                              ? "Update Grade"
                              : "Grade Submission"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={gradingSubmission !== null} onOpenChange={(open) => !open && setGradingSubmission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {gradingSubmission?.grade !== null && gradingSubmission?.grade !== undefined
                ? "Update Grade"
                : "Grade Submission"}
            </DialogTitle>
            <DialogDescription>
              {gradingSubmission && `Grade submission by ${gradingSubmission.studentName || `Student #${gradingSubmission.studentId}`}`}
            </DialogDescription>
          </DialogHeader>
          {gradingSubmission && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade (0-100)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  placeholder="Enter grade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Provide feedback to the student"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeForm({ grade: "", feedback: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleGradeSubmit}>
                  {gradingSubmission.grade !== null && gradingSubmission.grade !== undefined
                    ? "Update Grade"
                    : "Submit Grade"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {assignmentToDelete && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h3 className="font-semibold text-foreground">{assignmentToDelete.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {assignmentToDelete.description}
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  <strong>Warning:</strong> All submissions and grades associated with this assignment will also be deleted.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setAssignmentToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Assignment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
