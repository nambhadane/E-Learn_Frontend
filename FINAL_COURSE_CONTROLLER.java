package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.dto.CourseDTO;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.CourseService;
import com.elearnhub.teacher_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // ✅ Create course - matches frontend format
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createCourse(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Frontend sends: { name, subject, description }
            String courseName = request.get("name");
            String subject = request.get("subject");
            String description = request.get("description");

            // Use name if provided, otherwise use subject
            if (courseName == null || courseName.trim().isEmpty()) {
                courseName = subject != null ? subject : "Untitled Course";
            }

            if (description == null) {
                description = "";
            }

            // Create Course entity
            Course course = new Course();
            course.setName(courseName);
            course.setDescription(description);
            course.setTeacherId(teacher.getId());
            course.setStudents(new ArrayList<>()); // Initialize empty list

            // Save course
            Course createdCourse = courseService.createCourse(course);

            // Response format matching frontend expectations
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            
            Map<String, Object> courseResponse = new HashMap<>();
            courseResponse.put("id", createdCourse.getId());
            courseResponse.put("name", createdCourse.getName());
            courseResponse.put("subject", createdCourse.getName()); // For frontend compatibility
            courseResponse.put("description", createdCourse.getDescription());
            courseResponse.put("teacherId", createdCourse.getTeacherId());
            courseResponse.put("students", createdCourse.getStudents() != null ? 
                    createdCourse.getStudents().size() : 0);
            
            response.put("course", courseResponse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Get all courses for authenticated teacher (not all courses in system)
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Get courses for this teacher only
            List<Course> courses = courseService.getCoursesByTeacherId(teacher.getId());
            
            // Convert to frontend format
            List<Map<String, Object>> response = courses.stream()
                    .map(this::convertCourseToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch courses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Get single course by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourseById(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Optional<Course> courseOptional = courseService.getCourseById(id);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            return ResponseEntity.ok(convertCourseToResponse(course));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Update course
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Optional<Course> courseOptional = courseService.getCourseById(id);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course existingCourse = courseOptional.get();

            // Verify course belongs to teacher
            if (!existingCourse.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Update course fields
            if (request.containsKey("name")) {
                existingCourse.setName(request.get("name"));
            }
            if (request.containsKey("description")) {
                existingCourse.setDescription(request.get("description"));
            }

            Course updatedCourse = courseService.updateCourse(id, existingCourse);

            return ResponseEntity.ok(convertCourseToResponse(updatedCourse));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Delete course
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Optional<Course> courseOptional = courseService.getCourseById(id);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Helper method to convert Course to frontend response format
    private Map<String, Object> convertCourseToResponse(Course course) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", course.getId());
        response.put("name", course.getName());
        response.put("subject", course.getName()); // For frontend compatibility
        response.put("description", course.getDescription() != null ? course.getDescription() : "");
        response.put("teacherId", course.getTeacherId());
        response.put("students", course.getStudents() != null ? course.getStudents().size() : 0);
        return response;
    }
}

