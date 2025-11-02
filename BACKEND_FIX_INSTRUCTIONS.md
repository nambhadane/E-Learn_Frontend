# Backend Fix for Lesson Upload - 404 Error

## The Problem

Your `LessonController` expects `ClassEntity`, but you're using `Course`. The error:
```
RuntimeException: Class not found
Completed 404 NOT_FOUND
```

## Quick Fix Options

### Option A: Update Lesson Entity to Use Course (Simplest)

If `Lesson` can use `Course` directly:

**1. Update Lesson Entity:**
```java
@Entity
public class Lesson {
    // ... other fields ...
    
    // ❌ Change this:
    // @ManyToOne
    // @JoinColumn(name = "class_id")
    // private ClassEntity classEntity;
    
    // ✅ To this:
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
```

**2. Update LessonService.uploadLesson():**
```java
public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) {
    Course course = courseService.getCourseById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));
    
    // Save file and get path
    String filePath = fileStorageService.saveFile(file);
    
    Lesson lesson = new Lesson();
    lesson.setTitle(title);
    lesson.setFilePath(filePath);
    lesson.setCourse(course); // Use course instead of classEntity
    
    Lesson savedLesson = lessonRepository.save(lesson);
    return convertToDTO(savedLesson);
}
```

### Option B: Keep ClassEntity, Find/Create from Course

If you need to keep `ClassEntity`:

**Update LessonService to find or create ClassEntity:**
```java
public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) {
    Course course = courseService.getCourseById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));
    
    // Find or create ClassEntity for this course
    ClassEntity classEntity = classRepository.findByCourseId(courseId)
        .orElseGet(() -> {
            ClassEntity newClass = new ClassEntity();
            newClass.setCourse(course);
            // ... set other fields
            return classRepository.save(newClass);
        });
    
    // Save file and get path
    String filePath = fileStorageService.saveFile(file);
    
    Lesson lesson = new Lesson();
    lesson.setTitle(title);
    lesson.setFilePath(filePath);
    lesson.setClassEntity(classEntity);
    
    Lesson savedLesson = lessonRepository.save(lesson);
    return convertToDTO(savedLesson);
}
```

### Option C: Use Corrected Controller (Immediate Fix)

Use `CORRECTED_LESSON_CONTROLLER.java` - it validates Course exists before calling service.

## What to Check

1. **Does your `Lesson` entity need `ClassEntity` or can it use `Course`?**
   - If it can use Course → Option A (simplest)
   - If it needs ClassEntity → Option B

2. **Check your `LessonService.uploadLesson()` method:**
   - What does it expect?
   - Does it create ClassEntity or use Course?

3. **Database migration:**
   - If changing from `class_id` to `course_id`, you'll need to update the database

## Recommended Approach

**Use Option A** (Course directly) if possible, as you're already using Course entities for classes. This is simpler and matches your current architecture.

Share your `LessonService` code and I can provide the exact fix!

