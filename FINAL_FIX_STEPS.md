# Final Fix - Your Database is Partially Updated

## Current Status

✅ Column is already `course_id` (good!)
❌ Foreign key constraint might be pointing to wrong table
❌ Or constraint name is different

## Step-by-Step Fix

### Step 1: Check Existing Foreign Keys

Run this SQL to see what foreign keys exist:

```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'elearn_teacher'
    AND TABLE_NAME = 'lesson'
    AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**What to look for:**
- If `REFERENCED_TABLE_NAME` = `class_entity` → This is the problem! Note the `CONSTRAINT_NAME`
- If `REFERENCED_TABLE_NAME` = `course` → Already correct, skip to Step 4
- If no results → No foreign key exists, skip to Step 3

### Step 2: Drop Foreign Key Pointing to class_entity

If Step 1 shows a constraint pointing to `class_entity`, drop it:

```sql
ALTER TABLE lesson DROP FOREIGN KEY <CONSTRAINT_NAME>;
```

Replace `<CONSTRAINT_NAME>` with the actual name from Step 1.

### Step 3: Drop Existing fk_lesson_course (If It Exists)

Since you got "Duplicate foreign key constraint name", it might exist but point to wrong table:

```sql
ALTER TABLE lesson DROP FOREIGN KEY fk_lesson_course;
```

### Step 4: Add Correct Foreign Key

```sql
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;
```

### Step 5: Verify

```sql
SHOW CREATE TABLE lesson;
```

Look for:
```sql
CONSTRAINT `fk_lesson_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
```

**NOT:**
```sql
REFERENCES `class_entity` (`id`)
```

### Step 6: Restart Spring Boot

After fixing the foreign key, restart your Spring Boot application!

## Quick All-in-One Script

If you want to try everything at once:

```sql
USE elearn_teacher;

-- Drop any constraint pointing to class_entity
SET @fk_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'elearn_teacher' 
      AND TABLE_NAME = 'lesson' 
      AND REFERENCED_TABLE_NAME = 'class_entity'
    LIMIT 1
);

SET @sql = IF(@fk_name IS NOT NULL, 
    CONCAT('ALTER TABLE lesson DROP FOREIGN KEY ', @fk_name),
    'SELECT "No constraint pointing to class_entity found" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop fk_lesson_course if exists (might point to wrong table)
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = 'elearn_teacher' 
       AND TABLE_NAME = 'lesson' 
       AND CONSTRAINT_NAME = 'fk_lesson_course') > 0,
    'ALTER TABLE lesson DROP FOREIGN KEY fk_lesson_course',
    'SELECT "fk_lesson_course does not exist" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add correct foreign key
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;
```

## Summary

1. ✅ Column is `course_id` (already correct)
2. 🔍 Check what foreign keys exist
3. ❌ Drop any pointing to `class_entity`
4. ❌ Drop `fk_lesson_course` if it exists
5. ✅ Add correct foreign key pointing to `course`
6. 🔄 Restart Spring Boot

The key is finding and dropping the constraint that points to `class_entity`!

