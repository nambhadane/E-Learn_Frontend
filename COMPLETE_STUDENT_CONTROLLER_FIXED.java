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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssignmentService assignmentService; // ✅ ADDED: For assignments

    // ✅ Get enrolled classes for authenticated student
    @GetMapping("/classes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyClasses(Authentication authentication) {
        try {
            // Get student from authentication
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Get courses where this student is enrolled
            // IMPORTANT: CourseService must have getCoursesByStudentId() method
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());

            // If no courses found, return empty list
            if (enrolledCourses == null || enrolledCourses.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            // Convert to response format
            List<Map<String, Object>> response = enrolledCourses.stream()
                    .map(course -> {
                        Map<String, Object> classData = new HashMap<>();
                        classData.put("id", course.getId());
                        classData.put("name", course.getName());
                        
                        // Add description if available
                        if (course.getDescription() != null && !course.getDescription().trim().isEmpty()) {
                            classData.put("description", course.getDescription());
                        }
                        
                        // Note: Course entity doesn't have subject field
                        // For frontend compatibility, set subject to name
                        classData.put("subject", course.getName()); // For frontend compatibility
                        
                        // Get teacher information
                        if (course.getTeacherId() != null) {
                            try {
                                User teacher = userService.getUserById(course.getTeacherId())
                                        .orElse(null);
                                if (teacher != null) {
                                    // Use teacher's name if available, otherwise username
                                    String teacherName = teacher.getName() != null && !teacher.getName().trim().isEmpty()
                                            ? teacher.getName()
                                            : teacher.getUsername();
                                    classData.put("teacherName", teacherName);
                                    classData.put("teacherId", teacher.getId());
                                }
                            } catch (Exception e) {
                                // If teacher lookup fails, skip teacher info
                                System.err.println("Error fetching teacher for course " + course.getId() + ": " + e.getMessage());
                            }
                        }
                        
                        // Add student count
                        if (course.getStudents() != null) {
                            classData.put("students", course.getStudents().size());
                        } else {
                            classData.put("students", 0);
                        }
                        
                        return classData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

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

