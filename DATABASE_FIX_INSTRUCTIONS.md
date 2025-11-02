# Database Foreign Key Constraint Fix

## Problem

The error occurs because:
```
FOREIGN KEY (`course_id`) REFERENCES `class_entity` (`id`)
```

The database still has a foreign key constraint pointing to `class_entity` table, but we're trying to insert `course_id` values that reference the `course` table.

## Solution

You need to:
1. **Drop the old foreign key constraint** (pointing to `class_entity`)
2. **Rename column** (if still `class_id` → `course_id`)
3. **Add new foreign key constraint** (pointing to `course`)

## SQL Migration Script

Run this SQL script in your database:

```sql
-- Step 1: Drop old foreign key constraint
ALTER TABLE lesson 
DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- Step 2: Rename column if needed
ALTER TABLE lesson 
CHANGE COLUMN class_id course_id BIGINT;

-- Step 3: Add new foreign key constraint
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;
```

## If You Get "Foreign Key Doesn't Exist" Error

If the constraint name is different, first check what constraints exist:

```sql
-- Check existing foreign keys
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

Then drop the constraint using the correct name:

```sql
-- Replace CONSTRAINT_NAME with the actual name from above query
ALTER TABLE lesson 
DROP FOREIGN KEY CONSTRAINT_NAME;
```

## Alternative: Drop All Foreign Keys on lesson Table

If you're unsure about constraint names:

```sql
-- Get all foreign key constraint names
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'elearn_teacher' 
  AND TABLE_NAME = 'lesson' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Then drop each one (replace CONSTRAINT_NAME with actual names)
ALTER TABLE lesson DROP FOREIGN KEY CONSTRAINT_NAME;
```

## Complete Migration Script (Safe Version)

This version handles the case where constraints/columns might not exist:

```sql
-- Use your database
USE elearn_teacher;

-- Step 1: Drop old foreign key if exists
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'elearn_teacher' 
      AND TABLE_NAME = 'lesson' 
      AND REFERENCED_TABLE_NAME = 'class_entity'
    LIMIT 1
);

SET @sql = CONCAT('ALTER TABLE lesson DROP FOREIGN KEY ', @constraint_name);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Check if column exists and rename
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'elearn_teacher' 
      AND TABLE_NAME = 'lesson' 
      AND COLUMN_NAME = 'class_id'
);

SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT',
    'SELECT "Column already renamed or doesn''t exist" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add new foreign key constraint
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;
```

## Quick Fix (If You Can't Run Complex Scripts)

Simply run these commands one by one:

```sql
-- 1. Drop old constraint
ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- 2. Rename column
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- 3. Add new constraint
ALTER TABLE lesson ADD CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES course(id);
```

## Verification

After running the migration, verify:

```sql
-- Check table structure
DESCRIBE lesson;

-- Check foreign keys
SHOW CREATE TABLE lesson;
```

You should see:
- Column name: `course_id` (not `class_id`)
- Foreign key: References `course(id)` (not `class_entity(id)`)

## After Running Migration

1. Restart your Spring Boot application
2. Try uploading a note again
3. Should work now! ✅

