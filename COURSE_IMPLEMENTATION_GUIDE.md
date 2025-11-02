# Complete Course Implementation Guide

Based on your `Course` entity structure, here's the complete implementation.

## Your Course Entity Structure

- `id` - Auto-generated
- `name` - Course name (from frontend "name" or "subject")
- `description` - Course description
- `teacherId` - Teacher ID (from authentication)
- `students` - List of enrolled students (ManyToMany with User)

## Frontend Request Format

Frontend sends:
```json
{
  "name": "Data Structures",
  "subject": "Computer Science",
  "description": "Advanced data structures and algorithms"
}
```

**Note:** Frontend sends both `name` and `subject`. We'll use `name` as the course name (or `subject` if `name` is not provided).

## Implementation Steps

### Step 1: Create CourseRepository

```java
package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherId(Long teacherId);
}
```

### Step 2: Create CourseService

```java
package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Course updateCourse(Course course) {
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
```

### Step 3: Create/Update CourseController

**Option A: Create new CourseController** (if you want separate controllers):

```java
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
            // students list will be null/empty initially

            // Save course
            Course createdCourse = courseService.createCourse(course);

            // Response format matching frontend expectations
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            
            Map<String, Object> courseResponse = new HashMap<>();
            courseResponse.put("id", createdCourse.getId());
            courseResponse.put("name", createdCourse.getName());
            courseResponse.put("subject", createdCourse.getName()); // For compatibility
            courseResponse.put("description", createdCourse.getDescription());
            courseResponse.put("teacherId", createdCourse.getTeacherId());
            courseResponse.put("students", 0); // Initially 0 students
            
            response.put("course", courseResponse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
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
```

**Option B: Update existing ClassController** (if you want to keep one controller):

If you want to use the existing `ClassController`, you can add these methods to it and change the mapping. But I recommend keeping them separate since `Course` and `ClassEntity` are different entities.

## Security Configuration

Make sure `/courses` endpoint requires authentication:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/login", "/auth/register").permitAll()
    .requestMatchers("/courses").hasRole("TEACHER") // ✅ Should be here
    .requestMatchers("/classes").hasRole("TEACHER") // ✅ If you have both
    // ... rest
)
```

## Database Schema

Your `Course` entity should create a table like:

```sql
CREATE TABLE course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    teacher_id BIGINT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE course_student (
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES user(id) ON DELETE CASCADE
);
```

## Testing

1. **Test Create Course:**
```bash
curl -X POST http://localhost:8081/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Data Structures",
    "subject": "Computer Science",
    "description": "Advanced data structures and algorithms"
  }'
```

Expected response (201):
```json
{
  "message": "Course created successfully",
  "course": {
    "id": 1,
    "name": "Data Structures",
    "subject": "Data Structures",
    "description": "Advanced data structures and algorithms",
    "teacherId": 6,
    "students": 0
  }
}
```

2. **Test Get Courses:**
```bash
curl -X GET http://localhost:8081/courses \
  -H "Authorization: Bearer <your-token>"
```

Expected response (200):
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "subject": "Data Structures",
    "description": "Advanced data structures and algorithms",
    "teacherId": 6,
    "students": 0
  }
]
```

## Summary

✅ **What you need to do:**

1. Create `CourseRepository` interface
2. Create `CourseService` class
3. Create `CourseController` with POST and GET endpoints (or update existing)
4. Ensure `UserService` has `findByUsername()` method
5. Test the endpoints

The frontend is already configured to call `/courses` endpoint! 🎉

**Note:** If you also have `ClassEntity` that uses `Course`, you can keep both controllers separate:
- `/courses` - for Course management
- `/classes` - for ClassEntity management (if needed)

