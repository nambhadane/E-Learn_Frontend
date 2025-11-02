# LessonService Fix Summary

## Your Current Code

Your `LessonService` uses `ClassEntityRepository.findById(classId)`, but the frontend sends **Course IDs**.

## Two Solutions

### ✅ Option 1: Use Course Directly (Recommended)

**Simplest and matches your architecture** - Since you're already using `Course` for classes.

**Files to update:**
1. **Lesson Entity** - Change `ClassEntity classEntity` → `Course course`
2. **LessonRepository** - Change `findByClassEntityId()` → `findByCourse()` or `findByCourseId()`
3. **LessonService** - Use `UPDATED_LESSON_SERVICE_OPTION1.java`

**Pros:**
- Simpler - one less entity to manage
- Matches your current Course-based architecture
- No need for ClassEntity

**Cons:**
- Need to update database schema

### Option 2: Keep ClassEntity, Map from Course

If you need to keep `ClassEntity` for some reason.

**Files to update:**
1. **LessonService** - Use `UPDATED_LESSON_SERVICE_OPTION2.java`
2. **ClassEntityRepository** - Add method to find by Course or create mapping

**Pros:**
- Keeps existing ClassEntity structure

**Cons:**
- More complex - need to maintain Course → ClassEntity mapping
- Extra entity to manage

## Recommended: Use Option 1

Update your backend to use `Course` directly in `Lesson` entity. This is the cleanest solution.

## Quick Fix Steps

1. **Update Lesson Entity:**
   - Change `private ClassEntity classEntity` → `private Course course`
   - Change `@JoinColumn(name = "class_id")` → `@JoinColumn(name = "course_id")`

2. **Update LessonRepository:**
   ```java
   List<Lesson> findByCourse(Course course);
   // OR
   List<Lesson> findByCourseId(Long courseId);
   ```

3. **Update LessonService:**
   - Use `UPDATED_LESSON_SERVICE_OPTION1.java`
   - Replace `ClassEntityRepository` with `CourseRepository`
   - Change all `ClassEntity` references to `Course`

4. **Update Database:**
   ```sql
   ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;
   ```

## After Updates

Your upload should work! The frontend is already sending Course IDs correctly.

