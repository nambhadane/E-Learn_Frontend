-- ========================================
-- Cleanup: Drop Duplicate Foreign Key
-- ========================================
-- You have TWO foreign keys both pointing to course (which is correct!)
-- But having duplicates can cause issues
-- Drop the Hibernate-generated one, keep fk_lesson_course

USE elearn_teacher;

-- Drop the Hibernate-generated constraint (FKjs3c7skmg8bvdddok5lc7s807)
ALTER TABLE lesson DROP FOREIGN KEY FKjs3c7skmg8bvdddok5lc7s807;

-- Keep fk_lesson_course (the one we created)
-- This one should remain

-- Verify (optional)
SELECT 
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'elearn_teacher'
    AND TABLE_NAME = 'lesson'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- You should now see only ONE foreign key: fk_lesson_course

