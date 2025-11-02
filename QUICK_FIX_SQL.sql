-- Quick Fix SQL Script - Run these commands in order
-- Database: elearn_teacher

-- Step 1: Drop old foreign key constraint (pointing to class_entity)
ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- Step 2: Rename column from class_id to course_id (if not already renamed)
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- Step 3: Add new foreign key constraint (pointing to course table)
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;

-- Verify (optional - run to check)
-- SHOW CREATE TABLE lesson;

