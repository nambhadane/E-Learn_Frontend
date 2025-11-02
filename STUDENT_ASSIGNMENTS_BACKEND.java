// ===================================================================================
// BACKEND IMPLEMENTATION: Student Assignments
// Copy this code into your backend files
// ===================================================================================

// ===================================================================================
// 1. Add to StudentController.java (or AssignmentController.java)
// Location: src/main/java/com/elearnhub/teacher_service/Controller/StudentController.java
// OR: src/main/java/com/elearnhub/teacher_service/Controller/AssignmentController.java
// ===================================================================================

/*
    // ✅ NEW: Get assignments for enrolled classes (for students)
    @GetMapping("/assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyAssignments(Authentication authentication) {
        try {
            // Get student from authentication
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Get all courses where student is enrolled
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());

            if (enrolledCourses == null || enrolledCourses.isEmpty()) {
                return ResponseEntity.ok(List.of()); // No classes, no assignments
            }

            // Get all assignments from enrolled courses
            List<Map<String, Object>> allAssignments = new ArrayList<>();

            for (Course course : enrolledCourses) {
                if (course.getId() != null) {
                    // Get assignments for this course
                    List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourseId(course.getId());

                    // For each assignment, check if student has submitted it
                    for (AssignmentDTO assignment : assignments) {
                        Map<String, Object> assignmentData = new HashMap<>();
                        assignmentData.put("id", assignment.getId());
                        assignmentData.put("title", assignment.getTitle());
                        assignmentData.put("description", assignment.getDescription());
                        assignmentData.put("dueDate", assignment.getDueDate());
                        assignmentData.put("maxGrade", assignment.getMaxGrade());
                        assignmentData.put("courseId", assignment.getCourseId());
                        assignmentData.put("className", course.getName());

                        // Check if student has submitted this assignment
                        SubmissionDTO submission = assignmentService.getSubmissionByStudentAndAssignment(
                                student.getId(), assignment.getId());

                        if (submission != null && submission.getId() != null) {
                            // Student has submitted
                            assignmentData.put("status", submission.getGrade() != null ? "graded" : "submitted");
                            assignmentData.put("submissionId", submission.getId());
                            assignmentData.put("submittedAt", submission.getSubmittedAt());
                            assignmentData.put("grade", submission.getGrade());
                            assignmentData.put("feedback", submission.getFeedback());
                        } else {
                            // Student hasn't submitted yet
                            assignmentData.put("status", "pending");
                            assignmentData.put("submissionId", null);
                            assignmentData.put("submittedAt", null);
                            assignmentData.put("grade", null);
                            assignmentData.put("feedback", null);
                        }

                        allAssignments.add(assignmentData);
                    }
                }
            }

            // Sort by due date (soonest first)
            allAssignments.sort((a, b) -> {
                String dueDateA = (String) a.get("dueDate");
                String dueDateB = (String) b.get("dueDate");
                return dueDateA.compareTo(dueDateB);
            });

            return ResponseEntity.ok(allAssignments);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
*/

// ===================================================================================
// 2. Add to AssignmentService.java
// Location: src/main/java/com/elearnhub/teacher_service/service/AssignmentService.java
// ===================================================================================

/*
    // ✅ NEW: Get submission by student and assignment
    public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
        Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
                studentId, assignmentId);

        if (submissionOpt.isEmpty()) {
            return null; // No submission found
        }

        Submission submission = submissionOpt.get();
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setAssignmentId(submission.getAssignment().getId());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getName() != null ? 
                submission.getStudent().getName() : submission.getStudent().getUsername());
        dto.setContent(submission.getContent());
        dto.setFilePath(submission.getFilePath());
        dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
                submission.getSubmittedAt().toString() : null);
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());

        return dto;
    }
*/

// ===================================================================================
// 3. Add to SubmissionRepository.java (if using repository)
// Location: src/main/java/com/elearnhub/teacher_service/repository/SubmissionRepository.java
// ===================================================================================

/*
    // ✅ NEW: Find submission by student and assignment
    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
*/

// ===================================================================================
// 4. Add to AssignmentController.java (Alternative location)
// If you want to add it to AssignmentController instead of StudentController:
// ===================================================================================

/*
    // ✅ NEW: Get assignments for authenticated student
    @GetMapping("/student/assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentAssignments(Authentication authentication) {
        // Same implementation as above
        // ...
    }
*/

// ===================================================================================
// Required Imports:
// ===================================================================================
// import com.elearnhub.teacher_service.service.AssignmentService;
// import com.elearnhub.teacher_service.dto.AssignmentDTO;
// import com.elearnhub.teacher_service.dto.SubmissionDTO;
// import com.elearnhub.teacher_service.entity.Submission;
// import java.util.ArrayList;
// import java.util.Comparator;

// ===================================================================================
// IMPORTANT NOTES:
// ===================================================================================
// 1. Make sure AssignmentService has getAssignmentsByCourseId method
// 2. Make sure AssignmentService has getSubmissionByStudentAndAssignment method
// 3. Make sure SubmissionRepository has findByStudentIdAndAssignmentId method
// 4. Make sure you have CourseService.getCoursesByStudentId (already created)
// ===================================================================================

