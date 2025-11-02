package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.Assignment;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.AssignmentService;
import com.elearnhub.teacher_service.service.CourseService;
import com.elearnhub.teacher_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // ✅ Create assignment - validates Course exists and belongs to teacher
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createAssignment(
            @RequestBody AssignmentDTO assignmentDTO,
            Authentication authentication) {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify Course exists
            Optional<Course> courseOptional = courseService.getCourseById(assignmentDTO.getCourseId());
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found with id: " + assignmentDTO.getCourseId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Create assignment
            AssignmentDTO createdAssignment = assignmentService.createAssignment(assignmentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Get assignments by class/course - validates Course exists
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<?> getAssignmentsByClass(
            @PathVariable Long classId,
            Authentication authentication) {
        try {
            // Verify Course exists
            Optional<Course> courseOptional = courseService.getCourseById(classId);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found with id: " + classId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Get assignments for this course
            List<AssignmentDTO> assignments = assignmentService.getAssignmentsByClass(classId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Get submissions by assignment - validates Assignment exists and belongs to teacher
    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getSubmissionsByAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify Assignment exists
            AssignmentDTO assignmentDTO;
            try {
                assignmentDTO = assignmentService.getAssignmentById(assignmentId);
            } catch (RuntimeException e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Assignment not found with id: " + assignmentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify Course exists and belongs to teacher
            Optional<Course> courseOptional = courseService.getCourseById(assignmentDTO.getCourseId());
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found for this assignment");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Assignment does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Get submissions
            List<SubmissionDTO> submissions = assignmentService.getSubmissionsByAssignment(assignmentId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch submissions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Save submission (for students)
    @PostMapping("/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveSubmission(
            @RequestBody SubmissionDTO submissionDTO,
            Authentication authentication) {
        try {
            SubmissionDTO savedSubmission = assignmentService.saveSubmission(submissionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubmission);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to save submission: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Grade submission (for teachers)
    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody GradeRequest gradeRequest,
            Authentication authentication) {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Validate grade
            if (gradeRequest.getGrade() == null || gradeRequest.getGrade() < 0 || gradeRequest.getGrade() > 100) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Grade must be between 0 and 100");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Get submission to verify it exists and belongs to teacher's assignment
            SubmissionDTO submissionDTO = assignmentService.gradeSubmission(
                    submissionId, 
                    gradeRequest.getGrade(), 
                    gradeRequest.getFeedback()
            );

            // Verify assignment belongs to teacher (security check)
            AssignmentDTO assignmentDTO = assignmentService.getAssignmentById(submissionDTO.getAssignmentId());
            Optional<Course> courseOptional = courseService.getCourseById(assignmentDTO.getCourseId());
            
            if (courseOptional.isEmpty() || !courseOptional.get().getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Cannot grade this submission");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            return ResponseEntity.ok(submissionDTO);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to grade submission: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Delete assignment - validates Assignment exists and belongs to teacher's course
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteAssignment(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Get assignment to verify it exists and belongs to teacher's course
            AssignmentDTO assignmentDTO;
            try {
                assignmentDTO = assignmentService.getAssignmentById(id);
            } catch (RuntimeException e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Assignment not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify Course exists and belongs to teacher
            Optional<Course> courseOptional = courseService.getCourseById(assignmentDTO.getCourseId());
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found for this assignment");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Assignment does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Delete assignment
            assignmentService.deleteAssignment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Inner class for grade request
    static class GradeRequest {
        private Double grade;
        private String feedback;

        public Double getGrade() {
            return grade;
        }

        public void setGrade(Double grade) {
            this.grade = grade;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }
    }
}

