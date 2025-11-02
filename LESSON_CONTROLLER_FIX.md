# Lesson Controller Fix - Course vs ClassEntity Mismatch

## Problem

The backend `LessonController` is trying to find a `ClassEntity` by ID, but:
1. Frontend sends Course IDs (from `/courses` endpoint)
2. Backend expects `ClassEntity` IDs
3. `ClassEntity` with that ID doesn't exist → "Class not found" error

## Root Cause

From the logs:
```
Hibernate: select ce1_0.id,... from class_entity ce1_0 ... where ce1_0.id=?
RuntimeException: Class not found
```

The `Lesson` entity has:
```java
@ManyToOne
@JoinColumn(name = "class_id")
private ClassEntity classEntity;
```

But we're creating `Course` entities, not `ClassEntity` entities.

## Solution Options

### Option 1: Update Lesson to use Course (Recommended)

If you want to use Course directly (simpler):

1. **Update Lesson entity:**
```java
@Entity
@Data
@NoArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Title cannot be null")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @NotNull(message = "File path cannot be null")
    private String filePath;

    // ✅ Change from ClassEntity to Course
    @NotNull(message = "Course ID cannot be null")
    @ManyToOne
    @JoinColumn(name = "course_id") // Changed from class_id
    private Course course; // Changed from ClassEntity classEntity

    // Constructor and getters/setters
}
```

2. **Update LessonService to use Course:**
```java
public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) {
    Course course = courseService.getCourseById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));
    
    Lesson lesson = new Lesson();
    lesson.setTitle(title);
    lesson.setCourse(course);
    // ... file handling
}
```

### Option 2: Create ClassEntity from Course (Current Approach)

Keep using `ClassEntity` but create it from Course in `LessonService`:

```java
public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) {
    Course course = courseService.getCourseById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));
    
    // Find or create ClassEntity for this Course
    ClassEntity classEntity = classService.findOrCreateByCourse(course);
    
    Lesson lesson = new Lesson();
    lesson.setTitle(title);
    lesson.setClassEntity(classEntity);
    // ... file handling
}
```

### Option 3: Use Course ID in LessonController (Quick Fix)

See `CORRECTED_LESSON_CONTROLLER.java` - it verifies Course exists and belongs to teacher before calling LessonService.

## Recommended: Use Option 1 (Course instead of ClassEntity)

Since you're already using `Course` for classes, it makes sense to use `Course` in `Lesson` as well.

## Next Steps

1. Check your `LessonService.uploadLesson()` method - see how it handles `classId`
2. Update either:
   - Lesson entity to use `Course` instead of `ClassEntity`, OR
   - LessonService to find/create `ClassEntity` from `Course`
3. Use the corrected controller from `CORRECTED_LESSON_CONTROLLER.java`

The frontend is correct - it's sending Course IDs. The backend needs to be updated to handle Course IDs properly.

