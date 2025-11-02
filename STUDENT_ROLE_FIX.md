# Student Registration Role Fix

## Problem
When students register through the student portal, they were being saved with the "TEACHER" role in the database instead of "STUDENT".

## Root Cause
The backend `AuthController` defaults to "TEACHER" role when no role is provided:
```java
// Set default role to "TEACHER" if not provided
if (registerRequest.getRole() == null || registerRequest.getRole().trim().isEmpty()) {
    registerRequest.setRole("TEACHER");
}
```

The frontend was not sending the `role` field in the registration request, so the backend defaulted to "TEACHER".

## Solution

### Frontend Changes

**1. Updated `src/lib/api/studentApi.ts`**
- Added `role?: string` to `RegisterRequest` interface
- Modified `register()` method to automatically set `role: 'STUDENT'` before sending request

**2. Updated `src/lib/api/teacherApi.ts`**
- Added `role?: string` to `RegisterRequest` interface  
- Modified `register()` method to explicitly set `role: 'TEACHER'` for consistency

### How It Works Now

**Student Registration:**
```typescript
// Frontend automatically includes role
studentApi.register({
  name: "John Doe",
  email: "john@example.com",
  username: "johndoe",
  password: "password123",
  role: "STUDENT"  // Automatically added
})
```

**Teacher Registration:**
```typescript
// Frontend explicitly sets role
teacherApi.register({
  name: "Jane Smith",
  email: "jane@example.com",
  username: "janesmith",
  password: "password123",
  role: "TEACHER"  // Automatically added
})
```

## Backend Verification

Your backend should accept the `role` field from the request body. The `AuthController` should work correctly now:

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody User registerRequest) {
    // ... validation ...
    
    // If role is provided in request, it will be used
    // If not provided, defaults to TEACHER (for backward compatibility)
    if (registerRequest.getRole() == null || registerRequest.getRole().trim().isEmpty()) {
        registerRequest.setRole("TEACHER");
    }
    
    // ... rest of registration ...
}
```

## Testing

1. **Test Student Registration:**
   - Go to `/student/auth`
   - Click "Create Account"
   - Fill in registration form
   - Submit
   - **Verify**: Check database - user should have `role = "STUDENT"`

2. **Test Teacher Registration:**
   - Go to `/teacher/auth`
   - Click "Create Account"
   - Fill in registration form
   - Submit
   - **Verify**: Check database - user should have `role = "TEACHER"`

## Database Check

After registration, verify in your database:
```sql
SELECT username, role FROM user WHERE username = 'your_student_username';
-- Should show: role = "STUDENT"

SELECT username, role FROM user WHERE username = 'your_teacher_username';
-- Should show: role = "TEACHER"
```

## Notes

- The role is now explicitly set by the frontend
- Backend still has default to "TEACHER" for backward compatibility
- Both student and teacher registrations now work correctly
- No changes needed to backend code (it already handles role field)

