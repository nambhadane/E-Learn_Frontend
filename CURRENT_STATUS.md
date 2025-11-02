# Current Database Status

## ✅ Good News!

Both foreign keys are pointing to `course` table (correct!):
1. `fk_lesson_course` → `course(id)` ✅
2. `FKjs3c7skmg8bvdddok5lc7s807` → `course(id)` ✅

## ⚠️ Issue

Having **two foreign keys** on the same column can cause problems. Hibernate might be confused about which one to use.

## ✅ Solution

Drop the duplicate (Hibernate-generated one):

```sql
ALTER TABLE lesson DROP FOREIGN KEY FKjs3c7skmg8bvdddok5lc7s807;
```

Keep `fk_lesson_course` (the clean, named one we created).

## Next Steps

1. ✅ Drop duplicate foreign key (run SQL above)
2. 🔄 **RESTART Spring Boot application** (very important!)
3. 🧪 Test upload again

## Why Restart is Important

Spring Boot / Hibernate might have cached the old schema. Restarting ensures it picks up the current database state.

## If Still Getting Error

If you still get the error after:
1. Dropping duplicate FK
2. Restarting Spring Boot

Check if there are any **other constraints** on the lesson table:

```sql
SHOW CREATE TABLE lesson;
```

Look for any references to `class_entity` in the output.

## Summary

Your database is mostly correct! Just need to:
1. Clean up duplicate foreign key
2. Restart Spring Boot
3. Should work! ✅

