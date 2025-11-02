# Complete Fix for Lesson Upload - 404 Error

## Problem Summary

- Frontend sends **Course ID** (from `/courses` endpoint)
- Backend `LessonService` looks for **ClassEntity** 
- `ClassEntity` doesn't exist → "Class not found" error

## Solution: Update to Use Course

Since you're using `Course` entities for classes, update `Lesson` to use `Course` directly.

## Files to Update

### 1. Lesson Entity
**Change:** `ClassEntity classEntity` → `Course course`

**File:** `UPDATED_LESSON_ENTITY.java`

```java
@Entity
public class Lesson {
    // ... other fields ...
    
    // ✅ CHANGED: Use Course
    @ManyToOne
    @JoinColumn(name = "course_id") // Changed from class_id
    private Course course; // Changed from ClassEntity
}
```

### 2. LessonRepository
**Add method:** `findByCourse(Course course)`

**File:** `CORRECTED_LESSON_REPOSITORY.java`

```java
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourse(Course course);
    List<Lesson> findByCourseId(Long courseId);
}
```

### 3. LessonService
**Update:** Use `Course` instead of `ClassEntity`

**File:** `CORRECTED_LESSON_SERVICE.java`

Key changes:
- `uploadLesson()` finds `Course` by ID
- `getLessonsByClass()` finds lessons by `Course`
- File upload handling included

### 4. LessonController
**Update:** Already done in your current controller (has `required = false` for content)

**File:** `FINAL_LESSON_CONTROLLER.java` (with Course validation)

## Database Migration

After updating the entity, you need to update the database:

1. **Option A: Manual SQL**
```sql
ALTER TABLE lesson 
CHANGE COLUMN class_id course_id BIGINT;
```

2. **Option B: Let Hibernate update** (if using `spring.jpa.hibernate.ddl-auto=update`)
   - Hibernate will detect the change and update the schema

3. **Option C: Create migration script** (if using Flyway/Liquibase)

## Application Properties

Add file upload configuration:

```properties
# File upload settings
file.upload-dir=uploads/lessons
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## Testing

1. Update all 4 files (Entity, Repository, Service, Controller)
2. Restart Spring Boot
3. Upload a note from frontend
4. Should work! ✅

## Alternative: Keep ClassEntity (If You Need It)

If you need to keep `ClassEntity` for some reason, update `LessonService` to create/find `ClassEntity` from `Course`:

```java
public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));
    
    // Find or create ClassEntity for this Course
    ClassEntity classEntity = classRepository.findByCourseId(courseId)
        .orElseGet(() -> {
            ClassEntity newClass = new ClassEntity();
            newClass.setCourse(course);
            newClass.setName(course.getName());
            return classRepository.save(newClass);
        });
    
    // ... rest of upload logic
}
```

## Recommended Approach

**Use Course directly** (Option 1) - simpler and matches your current architecture.

