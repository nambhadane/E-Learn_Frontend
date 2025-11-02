# Student Classes Backend Endpoint

## Required Backend Endpoint

You need to create an endpoint for students to get their enrolled classes:

### GET `/student/classes`

**Authorization:** Requires authentication (student role)
**Headers:** `Authorization: Bearer <studentToken>`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "subject": "Computer Science",
    "description": "Advanced data structures and algorithms",
    "teacherName": "Prof. Sharma",
    "teacherId": 5,
    "schedule": "Mon, Wed 10:00 AM",
    "enrolledAt": "2025-01-15T10:00:00",
    "students": 45
  },
  {
    "id": 2,
    "name": "Web Development",
    "subject": "Computer Science",
    "description": "Full-stack web development fundamentals",
    "teacherName": "Prof. Sharma",
    "teacherId": 5,
    "schedule": "Tue, Thu 2:00 PM",
    "enrolledAt": "2025-01-15T10:00:00",
    "students": 38
  }
]
```

## Backend Implementation

### Option 1: Create StudentController (Recommended)

```java
package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.UserService;
import com.elearnhub.teacher_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    // Get enrolled classes for authenticated student
    @GetMapping("/classes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyClasses(Authentication authentication) {
        try {
            // Get student from authentication
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Get courses where this student is enrolled
            // Assuming Course entity has ManyToMany relationship with User (students)
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());

            // Convert to response format
            List<Map<String, Object>> response = enrolledCourses.stream()
                    .map(course -> {
                        Map<String, Object> classData = new HashMap<>();
                        classData.put("id", course.getId());
                        classData.put("name", course.getName());
                        classData.put("subject", course.getSubject() != null ? course.getSubject() : "");
                        classData.put("description", course.getDescription() != null ? course.getDescription() : "");
                        
                        // Get teacher information
                        if (course.getTeacherId() != null) {
                            User teacher = userService.getUserById(course.getTeacherId())
                                    .orElse(null);
                            if (teacher != null) {
                                classData.put("teacherName", teacher.getName() != null ? teacher.getName() : teacher.getUsername());
                                classData.put("teacherId", teacher.getId());
                            }
                        }
                        
                        classData.put("students", course.getStudents() != null ? course.getStudents().size() : 0);
                        
                        // Optional: Add enrollment date if available
                        // classData.put("enrolledAt", enrollment.getEnrolledAt());
                        
                        return classData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
```

### Option 2: Add to Existing CourseController

If you prefer to add it to your existing `CourseController`:

```java
// In CourseController.java

@GetMapping("/student/my-classes")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyEnrolledClasses(Authentication authentication) {
    try {
        String username = authentication.getName();
        User student = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());
        
        // Convert to response format (same as Option 1)
        // ...
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // Error handling
    }
}
```

### CourseService Method Needed

You'll need to add this method to your `CourseService`:

```java
public List<Course> getCoursesByStudentId(Long studentId) {
    // If Course has @ManyToMany with User
    // Option 1: Using repository with custom query
    return courseRepository.findByStudentsId(studentId);
    
    // Option 2: If you have enrollment entity
    // return enrollmentRepository.findCoursesByStudentId(studentId)
    //     .stream()
    //     .map(Enrollment::getCourse)
    //     .collect(Collectors.toList());
}
```

### CourseRepository Method

Add to your `CourseRepository`:

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    // Find courses where student is enrolled
    @Query("SELECT DISTINCT c FROM Course c JOIN c.students s WHERE s.id = :studentId")
    List<Course> findByStudentsId(@Param("studentId") Long studentId);
    
    // Or if using ManyToMany:
    List<Course> findByStudents_Id(Long studentId);
}
```

## Response Format Notes

The frontend expects:
- `id` - Course/Class ID
- `name` - Course name
- `subject` - Optional subject field
- `description` - Optional description
- `teacherName` - Teacher's name (display name)
- `teacherId` - Teacher's ID
- `schedule` - Optional schedule string
- `enrolledAt` - Optional enrollment date
- `students` - Total number of students in class

**Optional fields** can be omitted if not available.

## Testing

Once implemented, test with:

```bash
curl -X GET http://localhost:8082/student/classes \
  -H "Authorization: Bearer <studentToken>"
```

Should return list of enrolled classes for the authenticated student.

## Alternative Approach

If your backend uses a different structure (e.g., `ClassEntity` instead of `Course`), adapt the implementation accordingly. The key is:
1. Get authenticated student from token
2. Find all courses/classes where student is enrolled
3. Return formatted response with class details and teacher info

