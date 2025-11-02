// ===================================================================================
// FIX: AssignmentService Method Error
// The error: getAssignmentsByCourseId(Long) is undefined
// ===================================================================================

// ===================================================================================
// Solution 1: Use Existing Method (Recommended)
// Your AssignmentService already has getAssignmentsByClass(Long)
// Just change the method call in AssignmentController
// ===================================================================================

// In AssignmentController.java, change:
// ❌ OLD:
List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourseId(course.getId());

// ✅ NEW:
List<AssignmentDTO> assignments = assignmentService.getAssignmentsByClass(course.getId());

// ===================================================================================
// Solution 2: Add New Method to AssignmentService (Alternative)
// If you prefer getAssignmentsByCourseId name, add this to AssignmentService:
// ===================================================================================

/*
    // ✅ NEW: Get assignments by course ID (alias for getAssignmentsByClass)
    public List<AssignmentDTO> getAssignmentsByCourseId(Long courseId) {
        return getAssignmentsByClass(courseId);
    }
*/

// Or if you want to keep them separate:
/*
    // ✅ NEW: Get assignments by course ID
    public List<AssignmentDTO> getAssignmentsByCourseId(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
*/

// ===================================================================================
// Also Fix: Endpoint Path Issue
// ===================================================================================

// In AssignmentController.java, the endpoint path is wrong:
// ❌ OLD:
@GetMapping("/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(...)

// ✅ FIXED: Change to match the frontend endpoint
// Option 1: Add to StudentController (Recommended)
@GetMapping("/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(...)
// In StudentController (which is @RequestMapping("/student"))

// Option 2: Fix path in AssignmentController
@GetMapping("/student/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(...)
// This creates: /assignments/student/assignments (not ideal)

// ===================================================================================
// RECOMMENDED: Move to StudentController
// ===================================================================================

// Move the getMyAssignments method to StudentController.java:
// (Since it's student-specific and StudentController already exists)

/*
    // In StudentController.java (which has @RequestMapping("/student"))
    
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
                    // ✅ FIXED: Use getAssignmentsByClass instead of getAssignmentsByCourseId
                    List<AssignmentDTO> assignments = assignmentService.getAssignmentsByClass(course.getId());

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
// Required Imports for StudentController
// ===================================================================================

/*
import com.elearnhub.teacher_service.service.AssignmentService;
import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import java.util.ArrayList;
*/

// ===================================================================================
// Quick Fix Summary
// ===================================================================================
// 1. Change getAssignmentsByCourseId → getAssignmentsByClass
// 2. Move getMyAssignments to StudentController OR fix endpoint path
// 3. Make sure AssignmentService has getSubmissionByStudentAndAssignment method
// ===================================================================================

