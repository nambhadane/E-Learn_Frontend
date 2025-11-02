# Fixed Class Controller for Frontend Integration

## Issues Found

1. **Missing `@PostMapping` annotation** on `createClass` method
2. **Using `@RequestParam` instead of `@RequestBody`** - frontend sends JSON body
3. **Requires `courseId` as parameter** - frontend only sends name, subject, description
4. **Needs to get teacherId from authentication** - not from request parameter
5. **Response format doesn't match frontend expectations**

## Updated ClassController

Here's the corrected version that matches your frontend:

```java
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
import org.springframework.security.access.prepost.PreAuthorize;
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

    // ✅ Create class from frontend (name, subject, description)
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

            // Create Course entity (you may need to save it first if Course is separate)
            Course course = new Course();
            if (subject != null) {
                course.setSubject(subject);
            }
            if (description != null) {
                course.setDescription(description);
            }
            // If Course needs to be saved separately, do it here:
            // course = courseService.createOrGetCourse(course);

            // Create ClassEntity
            ClassEntity classEntity = new ClassEntity(name, teacher, course);
            ClassDTO classDTO = classService.createClass(classEntity);

            // Convert to frontend format
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Class created successfully");
            response.put("course", convertClassDTOToResponse(classDTO)); // Frontend expects "course"

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create class: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Get all classes for authenticated teacher
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
                    .map(this::convertClassDTOToResponse)
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Keep existing methods for backward compatibility
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

    // Helper method to convert ClassDTO to frontend response format
    private Map<String, Object> convertClassDTOToResponse(ClassDTO classDTO) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", classDTO.getId());
        response.put("name", classDTO.getName());
        response.put("subject", classDTO.getCourse() != null ? 
                classDTO.getCourse().getSubject() : "General");
        response.put("description", classDTO.getCourse() != null ? 
                classDTO.getCourse().getDescription() : "");
        response.put("students", classDTO.getStudents() != null ? 
                classDTO.getStudents().size() : 0);
        if (classDTO.getTeacher() != null) {
            response.put("teacherId", classDTO.getTeacher().getId());
        }
        return response;
    }
}
```

## Additional: Update ClassService

You may need to update your `ClassService.createClass` method to accept `ClassEntity` directly:

```java
public ClassDTO createClass(ClassEntity classEntity) {
    // Save the class entity
    ClassEntity saved = classRepository.save(classEntity);
    // Convert to DTO and return
    return convertToDTO(saved);
}
```

## Additional: Check Course Entity

If `Course` is a separate entity that needs to be saved first, you might need:

```java
@Autowired
private CourseService courseService; // If you have this

// In createClass method:
// First, create or get existing course
Course course = courseService.createOrGetCourse(subject, description);
// Then create class with the course
ClassEntity classEntity = new ClassEntity(name, teacher, course);
```

## Changes Summary

✅ **Fixed:**
1. Added `@PostMapping` annotation
2. Changed from `@RequestParam` to `@RequestBody`
3. Get teacherId from `Authentication` instead of request parameter
4. Create `Course` from subject/description
5. Response format matches frontend expectations
6. Added GET endpoint that gets teacher from authentication

## Testing

After updating:

1. **Test Create Class:**
```bash
curl -X POST http://localhost:8081/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Data Structures",
    "subject": "Computer Science",
    "description": "Advanced data structures and algorithms"
  }'
```

2. **Test Get Classes:**
```bash
curl -X GET http://localhost:8081/classes \
  -H "Authorization: Bearer <your-token>"
```

The frontend is already configured to call these endpoints! 🎉

