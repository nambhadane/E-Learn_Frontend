# ⚠️ URGENT: You Must Run SQL in Database

## The Problem

Your error shows:
```
FOREIGN KEY (`course_id`) REFERENCES `class_entity` (`id`)
```

This means the database **still has the old foreign key constraint** pointing to `class_entity` table instead of `course` table.

## ❗ IMPORTANT

**You MUST execute SQL commands in your MySQL database!** 

Just updating Java code is NOT enough - the database schema needs to be changed too.

## ✅ Quick Fix (3 Steps)

### Step 1: Open Your Database Tool

Open one of these:
- MySQL Workbench
- phpMyAdmin
- MySQL Command Line
- Any SQL client

### Step 2: Connect to Database

Connect to: `elearn_teacher` database

### Step 3: Copy & Paste This SQL

Open the file: **`COPY_PASTE_THIS.sql`**

Or copy this:
```sql
USE elearn_teacher;

ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;

ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;

ALTER TABLE lesson ADD CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
```

### Step 4: Execute

Click "Execute" or press F9 or Enter (depending on your tool)

### Step 5: Restart Spring Boot

**VERY IMPORTANT:** After running SQL, you MUST restart your Spring Boot application!

## Verification

After running SQL, verify with:
```sql
SHOW CREATE TABLE lesson;
```

You should see:
```sql
CONSTRAINT `fk_lesson_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
```

NOT:
```sql
REFERENCES `class_entity` (`id`)
```

## Common Mistakes

❌ **Mistake 1:** "I updated the Java code but didn't run SQL"
✅ **Fix:** You MUST run the SQL commands in your database!

❌ **Mistake 2:** "I ran SQL but didn't restart Spring Boot"
✅ **Fix:** Restart your Spring Boot application after running SQL!

❌ **Mistake 3:** "I connected to wrong database"
✅ **Fix:** Make sure you're connected to `elearn_teacher` database!

## Still Not Working?

If Step 1 (DROP FOREIGN KEY) fails, the constraint name might be different. Run this first:

```sql
SHOW CREATE TABLE lesson;
```

Find the foreign key constraint name in the output, then use that name in the DROP command.

## Summary

1. ✅ Run SQL commands (copy from `COPY_PASTE_THIS.sql`)
2. ✅ Restart Spring Boot
3. ✅ Try uploading again

The error will persist until you run the SQL commands!

