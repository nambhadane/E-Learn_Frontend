-- Fix Foreign Key Constraint for Lesson Table
-- This script fixes the foreign key constraint error
-- Run these commands one by one in your MySQL database

-- Step 1: Drop the old foreign key constraint
-- Note: MySQL doesn't support IF EXISTS for DROP FOREIGN KEY
-- If you get an error saying constraint doesn't exist, skip this step
ALTER TABLE lesson 
DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- Step 2: Check if column needs to be renamed
-- If column is still named 'class_id', rename it to 'course_id'
ALTER TABLE lesson 
CHANGE COLUMN class_id course_id BIGINT;

-- Step 3: Add new foreign key constraint pointing to course table
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;

-- Verify the change
-- SHOW CREATE TABLE lesson;

