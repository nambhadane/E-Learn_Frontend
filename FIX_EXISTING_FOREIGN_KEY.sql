-- ========================================
-- Step 1: Check what foreign keys exist on lesson table
-- ========================================
-- Run this first to see what constraints exist

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

-- ========================================
-- Step 2: Drop the foreign key that points to class_entity
-- ========================================
-- Replace 'YOUR_CONSTRAINT_NAME' with the actual constraint name from Step 1

-- ALTER TABLE lesson DROP FOREIGN KEY YOUR_CONSTRAINT_NAME;

-- ========================================
-- Step 3: If fk_lesson_course already exists but points to wrong table, drop it
-- ========================================
ALTER TABLE lesson DROP FOREIGN KEY fk_lesson_course;

-- ========================================
-- Step 4: Add the correct foreign key constraint
-- ========================================
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;

