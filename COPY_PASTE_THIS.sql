-- ========================================
-- COPY AND PASTE THIS ENTIRE BLOCK
-- Into MySQL Workbench, phpMyAdmin, or MySQL command line
-- ========================================

USE elearn_teacher;

-- STEP 1: Drop the old constraint
ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

-- STEP 2: Rename column (if needed - might already be renamed)
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

-- STEP 3: Add new constraint pointing to course table
ALTER TABLE lesson ADD CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;

-- DONE! Now restart your Spring Boot application

