# Course Integration Summary

## ✅ What's Ready

### Frontend (Already Done)
- ✅ API client configured for `/courses`
- ✅ Classes page connected to backend
- ✅ Form sends: `{ name, subject, description }`
- ✅ Displays courses in grid format
- ✅ Loading states and error handling

### Backend - What You Need to Do

## Required Changes

### 1. Update CourseService

Your current `CourseService` needs one change:

```java
// ❌ Current: 
public Course updateCourse(Course course) {
    return courseRepository.save(course);
}

// ✅ Should be:
public Course updateCourse(Long id, Course course) {
    Optional<Course> existingCourse = courseRepository.findById(id);
    if (existingCourse.isPresent()) {
        Course updatedCourse = existingCourse.get();
        updatedCourse.setName(course.getName());
        updatedCourse.setDescription(course.getDescription());
        updatedCourse.setTeacherId(course.getTeacherId());
        return courseRepository.save(updatedCourse);
    }
    throw new RuntimeException("Course not found with id: " + id);
}
```

Also, initialize students list in `createCourse`:

```java
public Course createCourse(Course course) {
    // Initialize students list if null
    if (course.getStudents() == null) {
        course.setStudents(new ArrayList<>());
    }
    return courseRepository.save(course);
}
```

### 2. Replace Your CourseController

Replace your current `CourseController` with the version in `FINAL_COURSE_CONTROLLER.java`. 

**Key Changes:**
- ✅ POST accepts `Map<String, String>` (not Course entity directly)
- ✅ Gets teacherId from Authentication
- ✅ Returns `{ message, course }` format
- ✅ GET filters by authenticated teacher (not all courses)
- ✅ Returns frontend-compatible format

### 3. Verify CourseRepository

Your `CourseRepository` is correct:
```java
List<Course> findByTeacherId(Long teacherId);
```

## Complete Updated Files

### CourseService (Updated)
```java
package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public Course createCourse(Course course) {
        // Initialize students list if null
        if (course.getStudents() == null) {
            course.setStudents(new ArrayList<>());
        }
        return courseRepository.save(course);
    }

    public List<Course> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Course updateCourse(Long id, Course course) {
        Optional<Course> existingCourse = courseRepository.findById(id);
        if (existingCourse.isPresent()) {
            Course updatedCourse = existingCourse.get();
            updatedCourse.setName(course.getName());
            updatedCourse.setDescription(course.getDescription());
            updatedCourse.setTeacherId(course.getTeacherId());
            return courseRepository.save(updatedCourse);
        }
        throw new RuntimeException("Course not found with id: " + id);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
```

### CourseController (Use FINAL_COURSE_CONTROLLER.java)

See `FINAL_COURSE_CONTROLLER.java` for the complete updated controller.

## Testing Checklist

After updating:

1. ✅ Start Spring Boot backend
2. ✅ Login as teacher (get token)
3. ✅ Create course from frontend:
   - Fill form: name, subject, description
   - Submit
   - Should see success message
   - Course should appear in grid
4. ✅ View courses:
   - Should show only courses for logged-in teacher
   - Should display correctly

## Expected API Flow

### Create Course
```
Frontend → POST /courses
Body: { "name": "...", "subject": "...", "description": "..." }
Headers: Authorization: Bearer <token>

Backend → Response
Status: 201 Created
Body: {
  "message": "Course created successfully",
  "course": {
    "id": 1,
    "name": "...",
    "subject": "...",
    "description": "...",
    "teacherId": 6,
    "students": 0
  }
}
```

### Get Courses
```
Frontend → GET /courses
Headers: Authorization: Bearer <token>

Backend → Response
Status: 200 OK
Body: [
  {
    "id": 1,
    "name": "...",
    "subject": "...",
    "description": "...",
    "teacherId": 6,
    "students": 0
  }
]
```

## Summary

**Replace:**
1. ✅ `CourseService.updateCourse()` - add `id` parameter
2. ✅ `CourseService.createCourse()` - initialize students list
3. ✅ `CourseController` - replace with FINAL_COURSE_CONTROLLER.java

**Keep:**
- ✅ CourseRepository (already correct)
- ✅ Course entity (already correct)

After these changes, everything should work! 🎉

