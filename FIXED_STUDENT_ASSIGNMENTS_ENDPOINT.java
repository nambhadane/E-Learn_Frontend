// ===================================================================================
// FIXED: Student Assignments Endpoint
// Fix both issues: Method name and endpoint path
// ===================================================================================

// ===================================================================================
// Option 1: Move to StudentController (RECOMMENDED)
// This is the cleanest approach - student endpoints belong in StudentController
// ===================================================================================

// Add to StudentController.java:

package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.service.UserService;
import com.elearnhub.teacher_service.service.CourseService;
import com.elearnhub.teacher_service.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssignmentService assignmentService; // ✅ ADD THIS

    // ... existing methods ...

    // ✅ FIXED: Get assignments for enrolled classes (for students)
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
}

// ===================================================================================
// Option 2: Fix in AssignmentController (Alternative)
// If you prefer to keep it in AssignmentController, fix the path and method name
// ===================================================================================

// In AssignmentController.java, REMOVE the getMyAssignments method and add this instead:

/*
    // ✅ FIXED: Get assignments for authenticated student
    @GetMapping("/student/assignments")  // ✅ FIXED: Changed from "/assignments" to "/student/assignments"
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentAssignments(Authentication authentication) {
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

                    // ... rest of the code is the same as Option 1 ...
                }
            }

            // ... rest of the code ...
        }
    }
*/

// ===================================================================================
// IMPORTANT: Make sure AssignmentService has getSubmissionByStudentAndAssignment
// ===================================================================================

// Add to AssignmentService.java:

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
// Required: Add to SubmissionRepository.java
// ===================================================================================

/*
    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
*/

// ===================================================================================
// Summary of Changes:
// ===================================================================================
// 1. ✅ Change getAssignmentsByCourseId → getAssignmentsByClass
// 2. ✅ Move endpoint to StudentController OR fix path to /student/assignments
// 3. ✅ Add AssignmentService to StudentController @Autowired
// 4. ✅ Make sure AssignmentService has getSubmissionByStudentAndAssignment method
// 5. ✅ Make sure SubmissionRepository has findByStudentIdAndAssignmentId method
// ===================================================================================

