# Lazy Initialization Error Fix

## Problem

When fetching courses, you get this error:
```
Failed to fetch courses: failed to lazily initialize a collection of role: 
com.elearnhub.teacher_service.entity.Course.students: 
could not initialize proxy - no Session
```

## Root Cause

The `Course` entity has a `@ManyToMany` relationship with `students` that is lazily loaded by default. When the controller tries to access `course.getStudents().size()`, the Hibernate session is already closed (transaction committed).

## Solution

We need to **eagerly fetch** the `students` collection when querying courses.

## Option 1: Using @EntityGraph (Recommended)

Update your `CourseRepository`:

```java
package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // ✅ Eagerly fetch students collection
    @EntityGraph(attributePaths = "students")
    List<Course> findByTeacherId(Long teacherId);
}
```

## Option 2: Using JOIN FETCH Query

Alternative approach using a custom query:

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.students WHERE c.teacherId = :teacherId")
    List<Course> findByTeacherIdWithStudents(@Param("teacherId") Long teacherId);
}
```

Then update `CourseService.getCoursesByTeacherId()` to use this method.

## Option 3: Initialize in Service (If options 1 or 2 don't work)

If you can't modify the repository, initialize the collection in the service:

```java
public List<Course> getCoursesByTeacherId(Long teacherId) {
    List<Course> courses = courseRepository.findByTeacherId(teacherId);
    
    // Force initialization of students collection within transaction
    for (Course course : courses) {
        if (course.getStudents() == null) {
            course.setStudents(new ArrayList<>());
        } else {
            // Force lazy loading within transaction
            course.getStudents().size(); // Triggers lazy load
        }
    }
    
    return courses;
}
```

## Recommended Solution

**Use Option 1** (`@EntityGraph`) as it's the cleanest and most efficient.

## Files to Update

1. **CourseRepository.java** - Add `@EntityGraph` annotation
2. **CourseService.java** - Already correct, but ensure it uses the updated repository method

## After Updating

1. Restart your Spring Boot application
2. Test GET `/courses` endpoint
3. The error should be resolved

## Why This Works

- `@EntityGraph` tells Hibernate to fetch the `students` collection in the same query
- This happens within the transaction, so the session is still open
- When the controller accesses `course.getStudents().size()`, the data is already loaded

