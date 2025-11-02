package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.dto.ClassDTO;
import com.elearnhub.teacher_service.entity.ClassEntity;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.ClassService;
import com.elearnhub.teacher_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/classes")
public class ClassController {

    @Autowired
    private ClassService classService;

    @Autowired
    private UserService userService;

    // ✅ NEW: Create class from frontend request (name, subject, description)
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createClass(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            String name = request.get("name");
            String subject = request.get("subject");
            String description = request.get("description");

            if (name == null || name.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Class name is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Create or get Course from subject/description
            // Option 1: Create a new Course for each class
            Course course = new Course();
            course.setSubject(subject != null ? subject : "General");
            course.setDescription(description != null ? description : "");
            // You might need to save course first if it's a separate entity
            // course = courseService.createCourse(course);

            // Create ClassEntity
            ClassEntity classEntity = new ClassEntity(name, teacher, course);
            ClassDTO classDTO = classService.createClass(classEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Class created successfully");
            response.put("class", convertToResponse(classDTO));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create class: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ UPDATED: Get classes for authenticated teacher
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getClasses(Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<ClassDTO> classes = classService.getClassesByTeacher(teacher.getId());
            
            // Convert to frontend format
            List<Map<String, Object>> response = classes.stream()
                    .map(this::convertToResponse)
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ UPDATED: Original method (keep for backward compatibility)
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ClassDTO>> getClassesByTeacher(@PathVariable Long teacherId) {
        List<ClassDTO> classes = classService.getClassesByTeacher(teacherId);
        return ResponseEntity.ok(classes);
    }
    
    @PostMapping("/{classId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> addStudentToClass(@PathVariable Long classId, @RequestParam Long studentId) {
        classService.addStudentToClass(classId, studentId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getClassesForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(classService.getClassesForStudent(studentId));
    }

    // Helper method to convert ClassDTO to frontend format
    private Map<String, Object> convertToResponse(ClassDTO classDTO) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", classDTO.getId());
        response.put("name", classDTO.getName());
        response.put("subject", classDTO.getCourse() != null ? 
                classDTO.getCourse().getSubject() : "General");
        response.put("description", classDTO.getCourse() != null ? 
                classDTO.getCourse().getDescription() : "");
        response.put("students", classDTO.getStudents() != null ? 
                classDTO.getStudents().size() : 0);
        response.put("teacherId", classDTO.getTeacher() != null ? 
                classDTO.getTeacher().getId() : null);
        return response;
    }
}

