package com.elearnhub.teacher_service.Controller;

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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // ✅ Create course from frontend (name, subject, description)
    // Note: Frontend sends "subject" but Course entity has "name"
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
            // We'll use "name" as course name, or "subject" if name is not provided
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
            // Students list will be initialized as empty

            // Save course
            Course createdCourse = courseService.createCourse(course);

            // Convert to frontend response format
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            
            Map<String, Object> courseResponse = new HashMap<>();
            courseResponse.put("id", createdCourse.getId());
            courseResponse.put("name", createdCourse.getName());
            courseResponse.put("subject", createdCourse.getName()); // For compatibility
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

    // ✅ Get all courses for authenticated teacher
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<Course> courses = courseService.getCoursesByTeacherId(teacher.getId());
            
            // Convert to frontend format
            List<Map<String, Object>> response = courses.stream()
                    .map(this::convertCourseToResponse)
                    .toList();

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

            Course course = courseService.getCourseById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

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

