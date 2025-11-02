# Backend Implementation for Create Class Feature

This guide shows you how to implement the backend endpoints for creating and managing classes/courses.

## Required Backend Endpoints

### 1. POST `/courses` - Create a new class/course

**Request:**
```json
{
  "name": "Data Structures",
  "subject": "Computer Science",
  "description": "Advanced data structures and algorithms"
}
```

**Response (201 Created):**
```json
{
  "message": "Course created successfully",
  "course": {
    "id": 1,
    "name": "Data Structures",
    "subject": "Computer Science",
    "description": "Advanced data structures and algorithms",
    "teacherId": 6,
    "students": 0,
    "createdAt": "2025-11-02T10:30:00",
    "updatedAt": "2025-11-02T10:30:00"
  }
}
```

### 2. GET `/courses` - Get all classes for authenticated teacher

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "subject": "Computer Science",
    "description": "Advanced data structures and algorithms",
    "teacherId": 6,
    "students": 0,
    "createdAt": "2025-11-02T10:30:00",
    "updatedAt": "2025-11-02T10:30:00"
  },
  {
    "id": 2,
    "name": "Web Development",
    "subject": "Computer Science",
    "description": "Full-stack web development fundamentals",
    "teacherId": 6,
    "students": 0,
    "createdAt": "2025-11-02T11:00:00",
    "updatedAt": "2025-11-02T11:00:00"
  }
]
```

### 3. GET `/courses/{id}` - Get a single class by ID (Optional)

### 4. PUT `/courses/{id}` - Update a class (Optional)

### 5. DELETE `/courses/{id}` - Delete a class (Optional)

## Backend Implementation

### Step 1: Create Course Entity

```java
package com.elearnhub.teacher_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long teacherId; // Foreign key to User table

    @Column(nullable = false)
    private Integer students = 0; // Default to 0

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

### Step 2: Create Course Repository

```java
package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherId(Long teacherId);
    Optional<Course> findByIdAndTeacherId(Long id, Long teacherId);
}
```

### Step 3: Create Course Service

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

    public Optional<Course> getCourseByIdAndTeacherId(Long id, Long teacherId) {
        return courseRepository.findByIdAndTeacherId(id, teacherId);
    }

    public Course updateCourse(Course course) {
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
```

### Step 4: Create Course Controller

```java
package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course courseRequest, Authentication authentication) {
        try {
            // Get teacher ID from authentication
            String username = authentication.getName();
            // You'll need to get the user ID from username
            // For now, assuming you have a way to get teacher ID
            // Long teacherId = userService.findByUsername(username).getId();
            
            // For this example, let's use a helper method
            Long teacherId = getTeacherIdFromAuthentication(authentication);
            
            // Set teacher ID
            courseRequest.setTeacherId(teacherId);
            courseRequest.setStudents(0); // Initialize with 0 students

            // Create course
            Course createdCourse = courseService.createCourse(courseRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            response.put("course", createdCourse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
            Long teacherId = getTeacherIdFromAuthentication(authentication);
            List<Course> courses = courseService.getCoursesByTeacherId(teacherId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch courses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id, Authentication authentication) {
        try {
            Long teacherId = getTeacherIdFromAuthentication(authentication);
            Optional<Course> course = courseService.getCourseByIdAndTeacherId(id, teacherId);
            
            if (course.isPresent()) {
                return ResponseEntity.ok(course.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Helper method to get teacher ID from authentication
    // You'll need to implement this based on your UserService
    private Long getTeacherIdFromAuthentication(Authentication authentication) {
        // Option 1: If you store user ID in JWT token claims
        // You can extract it from authentication.getPrincipal()
        
        // Option 2: Fetch from database using username
        String username = authentication.getName();
        // Long teacherId = userService.findByUsername(username).getId();
        
        // For now, return a placeholder - you need to implement this
        // This is just an example - you'll need to get the actual user ID
        return 1L; // Replace with actual implementation
    }
}
```

## Important: Get Teacher ID from Authentication

You need to implement `getTeacherIdFromAuthentication()` method. Here are two options:

### Option 1: Store User ID in JWT Token

Update your `JwtUtil` to include user ID in the token claims, then extract it:

```java
// In JwtUtil when creating token:
Claims claims = Jwts.builder()
    .setSubject(user.getUsername())
    .claim("userId", user.getId()) // Add user ID
    .claim("role", user.getRole())
    // ... rest of token building
```

Then in controller:
```java
private Long getTeacherIdFromAuthentication(Authentication authentication) {
    // If using JWT with custom claims
    Object principal = authentication.getPrincipal();
    // Extract user ID from principal or from UserService
    String username = authentication.getName();
    User user = userService.findByUsername(username).orElseThrow();
    return user.getId();
}
```

### Option 2: Use UserService to Fetch User ID

```java
@Autowired
private UserService userService;

private Long getTeacherIdFromAuthentication(Authentication authentication) {
    String username = authentication.getName();
    User user = userService.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
}
```

## Security Configuration

Make sure `/courses` endpoint requires authentication (which it should already):

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/login", "/auth/register").permitAll()
    .requestMatchers("/courses").hasRole("TEACHER") // ✅ Should already be here
    // ... rest
)
```

## Database Migration

Create the `course` table:

```sql
CREATE TABLE course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id BIGINT NOT NULL,
    students INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES user(id) ON DELETE CASCADE
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

2. **Test Get Courses:**
```bash
curl -X GET http://localhost:8081/courses \
  -H "Authorization: Bearer <your-token>"
```

## Summary

✅ **What you need to do:**

1. Create `Course` entity
2. Create `CourseRepository`
3. Create `CourseService`
4. Create `CourseController` with POST and GET endpoints
5. Implement `getTeacherIdFromAuthentication()` method
6. Test the endpoints

The frontend is already configured and will call `/courses` endpoint! 🎉

