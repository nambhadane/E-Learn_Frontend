-- ============================================
-- EXECUTE THIS SQL IN YOUR DATABASE
-- ============================================
-- Database: elearn_teacher
-- Run this in MySQL Workbench, phpMyAdmin, or command line
-- ============================================

USE elearn_teacher;

-- Step 1: DROP THE OLD FOREIGN KEY CONSTRAINT
-- This is the constraint causing the error
ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- Step 2: Check if column needs renaming
-- If you see an error about column not existing, skip this step
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- Step 3: ADD NEW FOREIGN KEY POINTING TO course TABLE
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;

-- Step 4: Verify it worked
SHOW CREATE TABLE lesson;

-- You should see the foreign key now references 'course(id)' not 'class_entity(id)'

