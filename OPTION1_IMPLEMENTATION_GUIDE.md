# Option 1: Complete Implementation Guide - Using Course Directly

## Files to Update

Replace your existing files with the provided corrected versions:

### 1. Lesson Entity
**File:** `com.elearnhub.teacher_service.entity.Lesson`
**Replace with:** `OPTION1_COMPLETE_LESSON_ENTITY.java`

**Key Changes:**
- Changed `ClassEntity classEntity` → `Course course`
- Changed `@JoinColumn(name = "class_id")` → `@JoinColumn(name = "course_id")`

### 2. LessonRepository
**File:** `com.elearnhub.teacher_service.repository.LessonRepository`
**Replace with:** `OPTION1_COMPLETE_LESSON_REPOSITORY.java`

**Key Changes:**
- Removed: `findByClassEntityId(Long classId)`
- Added: `findByCourse(Course course)` and `findByCourseId(Long courseId)`

### 3. LessonService
**File:** `com.elearnhub.teacher_service.service.LessonService`
**Replace with:** `OPTION1_COMPLETE_LESSON_SERVICE.java`

**Key Changes:**
- Changed dependency: `ClassEntityRepository` → `CourseRepository`
- Updated `uploadLesson()` to use `Course` instead of `ClassEntity`
- Updated `getLessonsByClass()` to use `findByCourseId()` instead of `findByClassEntityId()`
- Added `convertToDTO()` helper method

### 4. LessonController
**File:** `com.elearnhub.teacher_service.Controller.LessonController`
**Replace with:** `OPTION1_COMPLETE_LESSON_CONTROLLER.java`

**Key Changes:**
- Already validates Course exists before calling LessonService
- Properly handles Course ID (sent as `classId` from frontend)

### 5. LessonDTO (If Needed)
**File:** `com.elearnhub.teacher_service.dto.LessonDTO`
**Check if exists:** `OPTION1_LESSON_DTO.java` (provided as reference)

## Database Migration

After updating the entity, update your database schema:

### Option A: Manual SQL (Recommended for Production)
```sql
-- If the column exists as class_id
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- If you need to add foreign key constraint
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id);
```

### Option B: Hibernate Auto-Update (For Development Only)
If you're using `spring.jpa.hibernate.ddl-auto=update` in your `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```
Hibernate will automatically update the schema.

⚠️ **Warning:** Don't use `ddl-auto=update` in production!

### Option C: Migration Script (If Using Flyway/Liquibase)
Create a migration script:
```sql
-- V1__change_lesson_class_to_course.sql
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id);
```

## Application Properties

Add file upload configuration to `application.properties`:

```properties
# File upload settings
file.upload-dir=uploads/lessons
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# If using Hibernate auto-update (development only)
# spring.jpa.hibernate.ddl-auto=update
```

## Directory Structure

Make sure the upload directory exists (or will be created):
- Default: `uploads/lessons/` (relative to project root)
- Files will be saved as: `uploads/lessons/{timestamp}_{original_filename}`

## Testing Steps

1. **Update all 4 files** (Entity, Repository, Service, Controller)
2. **Update database schema** (see Database Migration section)
3. **Restart Spring Boot application**
4. **Test upload:**
   - Go to Notes page in frontend
   - Select a class (Course)
   - Upload a file
   - Should succeed! ✅
5. **Test fetch:**
   - Upload a note
   - Refresh Notes page
   - Should see uploaded note listed ✅

## Troubleshooting

### Error: "Course not found"
- Check that Course ID exists in database
- Verify Course belongs to authenticated teacher

### Error: "Unauthorized: Course does not belong to this teacher"
- Course exists but doesn't belong to logged-in teacher
- Verify `Course.teacherId` matches authenticated user's ID

### Error: "Table 'lesson' doesn't have column 'course_id'"
- Database schema not updated
- Run the SQL migration script (see Database Migration)

### Files not saving
- Check `uploads/lessons/` directory exists
- Verify write permissions
- Check application logs for file system errors

## Summary

✅ All files updated to use `Course` instead of `ClassEntity`
✅ Frontend sends Course IDs correctly
✅ Backend validates Course exists and belongs to teacher
✅ File uploads work correctly
✅ Lessons are fetched by Course ID

After implementing these changes, your notes upload feature should work perfectly! 🎉

