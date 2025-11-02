# Step-by-Step Database Fix

## ⚠️ IMPORTANT: You MUST Run SQL in Your Database

The error persists because the database constraint hasn't been updated yet. **You need to execute SQL commands in your MySQL database.**

## Step 1: Connect to Your Database

Open one of these:
- **MySQL Workbench**
- **phpMyAdmin** 
- **MySQL Command Line**
- **HeidiSQL**
- **DBeaver**

Connect to your database: `elearn_teacher`

## Step 2: Run These SQL Commands

Copy and paste these **ONE AT A TIME** into your SQL tool:

### Command 1: Drop Old Constraint
```sql
ALTER TABLE lesson DROP FOREIGN KEY FKpf9qojkk3789spxnsxourvuiw;
```

**Expected Result:** Query OK (or success message)

**If you get an error** saying constraint doesn't exist, check what constraints exist:
```sql
SHOW CREATE TABLE lesson;
```
Look for the foreign key name in the output.

### Command 2: Rename Column (if needed)
```sql
ALTER TABLE lesson CHANGE COLUMN class_id course_id BIGINT;
```

**Expected Result:** Query OK (or success message)

**If you get an error** saying column doesn't exist, the column is already renamed - skip this.

### Command 3: Add New Foreign Key
```sql
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_course 
FOREIGN KEY (course_id) REFERENCES course(id) 
ON DELETE CASCADE;
```

**Expected Result:** Query OK (or success message)

### Command 4: Verify (Optional)
```sql
SHOW CREATE TABLE lesson;
```

Look at the output - you should see:
```sql
CONSTRAINT `fk_lesson_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
```

NOT:
```sql
REFERENCES `class_entity` (`id`)
```

## Step 3: Restart Spring Boot

After running the SQL:
1. Stop your Spring Boot application
2. Start it again
3. Try uploading a note

## Troubleshooting

### Error: "Cannot drop foreign key constraint"
The constraint name might be different. Run:
```sql
SHOW CREATE TABLE lesson;
```
Find the foreign key name in the output and use that instead of `FKpf9qojkk3789spxnsxourvuiw`.

### Error: "Column 'class_id' doesn't exist"
The column is already renamed - skip Step 2.

### Error: "Duplicate key name 'fk_lesson_course'"
The constraint already exists - skip Step 3.

### Still Getting the Same Error?
1. Make sure you **restarted** Spring Boot after running SQL
2. Check if there are **multiple foreign keys** - drop all of them:
```sql
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'elearn_teacher' 
  AND TABLE_NAME = 'lesson' 
  AND REFERENCED_TABLE_NAME = 'class_entity';
```

Then drop each one:
```sql
ALTER TABLE lesson DROP FOREIGN KEY <constraint_name>;
```

## Quick Verification

After running the SQL, verify with:
```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'elearn_teacher'
    AND TABLE_NAME = 'lesson'
    AND REFERENCED_TABLE_NAME IS NOT NULL;
```

You should see:
- `REFERENCED_TABLE_NAME` = `course` (NOT `class_entity`)

