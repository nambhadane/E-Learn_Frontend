# Option 1: All Corrected Code Files - Complete List

## 📁 Files to Replace in Your Backend

Replace your existing backend files with the following corrected versions:

### 1. ✅ Lesson Entity
**File Path:** `com.elearnhub.teacher_service.entity.Lesson`
**Source File:** `OPTION1_COMPLETE_LESSON_ENTITY.java`

**Key Changes:**
- `ClassEntity classEntity` → `Course course`
- `@JoinColumn(name = "class_id")` → `@JoinColumn(name = "course_id")`

### 2. ✅ Lesson Repository
**File Path:** `com.elearnhub.teacher_service.repository.LessonRepository`
**Source File:** `OPTION1_COMPLETE_LESSON_REPOSITORY.java`

**Key Changes:**
- Removed: `findByClassEntityId(Long classId)`
- Added: `findByCourse(Course course)` and `findByCourseId(Long courseId)`

### 3. ✅ Lesson Service
**File Path:** `com.elearnhub.teacher_service.service.LessonService`
**Source File:** `OPTION1_COMPLETE_LESSON_SERVICE.java`

**Key Changes:**
- `ClassEntityRepository` → `CourseRepository`
- `uploadLesson()` now uses `Course` instead of `ClassEntity`
- `getLessonsByClass()` uses `findByCourseId()` method
- Added `convertToDTO()` helper method

### 4. ✅ Lesson Controller
**File Path:** `com.elearnhub.teacher_service.Controller.LessonController`
**Source File:** `OPTION1_COMPLETE_LESSON_CONTROLLER.java`

**Key Changes:**
- Validates Course exists before calling LessonService
- Verifies Course belongs to authenticated teacher
- Properly handles Course ID (sent as `classId` from frontend)

### 5. ✅ LessonDTO (Reference - Update if Needed)
**File Path:** `com.elearnhub.teacher_service.dto.LessonDTO`
**Source File:** `OPTION1_LESSON_DTO.java`

**Note:** Use this if your LessonDTO doesn't exist or needs updating.

---

## 🗄️ Database Migration Required

After updating the entity, you **must** update your database:

### SQL Migration Script
```sql
-- Change column name from class_id to course_id
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- Add foreign key constraint (optional but recommended)
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id);
```

---

## ⚙️ Application Properties

Add to your `application.properties`:

```properties
# File upload settings
file.upload-dir=uploads/lessons
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## 📋 Implementation Checklist

- [ ] 1. Copy `OPTION1_COMPLETE_LESSON_ENTITY.java` → Replace your `Lesson.java`
- [ ] 2. Copy `OPTION1_COMPLETE_LESSON_REPOSITORY.java` → Replace your `LessonRepository.java`
- [ ] 3. Copy `OPTION1_COMPLETE_LESSON_SERVICE.java` → Replace your `LessonService.java`
- [ ] 4. Copy `OPTION1_COMPLETE_LESSON_CONTROLLER.java` → Replace your `LessonController.java`
- [ ] 5. Update `application.properties` with file upload settings
- [ ] 6. Run database migration SQL script
- [ ] 7. Restart Spring Boot application
- [ ] 8. Test file upload from frontend
- [ ] 9. Test file download/listing from frontend

---

## ✅ Expected Result

After implementing all changes:
- ✅ Upload notes works
- ✅ View notes list works
- ✅ Download notes works
- ✅ No more "Class not found" errors
- ✅ No more 404 errors

---

## 📚 Reference Files

- **Implementation Guide:** `OPTION1_IMPLEMENTATION_GUIDE.md` - Detailed step-by-step guide
- **All Files:** Listed above with source files

---

## 🆘 Quick Troubleshooting

**Error: "Course not found"**
→ Check Course ID exists in database

**Error: "Unauthorized: Course does not belong to this teacher"**
→ Course exists but belongs to different teacher

**Error: "Table doesn't have column 'course_id'"**
→ Run database migration SQL script

**Files not uploading**
→ Check `uploads/lessons/` directory exists and has write permissions

---

**All files are ready! Just copy them to your backend and follow the checklist.** 🚀

