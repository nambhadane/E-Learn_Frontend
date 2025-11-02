# Fix: getUserById Method Error

## Problem
Error: `The method findById(Long) in the type CrudRepository<User,Long> is not applicable for the arguments (User)`

## Root Cause
Your `getUserById` method has the wrong signature:

```java
// ❌ WRONG:
public Optional<User> getUserById(User user) {
    return userRepository.findById(user);  // Passing User object instead of Long ID
}
```

The `findById()` method from JpaRepository expects a `Long` (the ID), not a `User` object.

## Solution

### Fix: Change Method Signature

```java
// ✅ FIXED:
public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);  // Pass Long ID
}
```

## Complete Fixed UserService

**Replace your `getUserById` method with:**

```java
// ✅ FIXED: Get user by ID (Long, not User)
public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
}
```

## Where This Method Is Used

This method is called in several places:

1. **StudentController** - Getting teacher info:
```java
User teacher = userService.getUserById(course.getTeacherId())
        .orElse(null);
```

2. **CourseController** - Getting teacher info

3. **AssignmentController** - Getting teacher info

All of these call `getUserById(Long id)` with a `Long` ID, so the method signature must be `getUserById(Long id)`.

## Complete Fix

**Just change this one method in UserService.java:**

```java
// ❌ OLD (causing error):
public Optional<User> getUserById(User user) {
    return userRepository.findById(user);
}

// ✅ NEW (fixed):
public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
}
```

## Testing

After fixing, all these calls will work correctly:
```java
Optional<User> user = userService.getUserById(1L);  // ✅ Works
Optional<User> user = userService.getUserById(userId);  // ✅ Works
```

The error should be completely resolved!

