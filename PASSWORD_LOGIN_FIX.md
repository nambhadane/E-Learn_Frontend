# Password Login Fix - Troubleshooting Guide

## Problem
Login failing with "Failed to authenticate since password does not match stored value" even with correct credentials.

## Immediate Solutions

### Solution 1: Check Password Format in Database (First Step)

Run this SQL query to check your password format:
```sql
SELECT username, email, 
       SUBSTRING(password, 1, 30) as password_preview,
       LENGTH(password) as password_length,
       CASE WHEN password LIKE '$2%' THEN 'BCrypt Format' ELSE 'NOT BCrypt' END as format_check
FROM user 
WHERE username = 'Namrata1805';
```

**Expected Result:**
- Password should be ~60 characters long
- Password should start with `$2a$` or `$2b$` (BCrypt format)

**If password is NOT in BCrypt format**, you need to reset it (see Solution 2).

### Solution 2: Reset Password Using SQL (Quick Fix)

**Option A: Reset to a known password**

Run this SQL to reset password for your user. Replace `'YourNewPassword123'` with your desired password:

```sql
-- First, check if BCrypt is available in your database
-- If not, you'll need to encode it in the backend

-- Option 1: Use a BCrypt hash (this is a hash for password "password123")
-- Replace with your own BCrypt hash
UPDATE user 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
WHERE username = 'Namrata1805';
```

**Option B: Generate BCrypt Hash**

Use this Java code to generate a BCrypt hash for your password, then update the database:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("YourPasswordHere");
System.out.println("BCrypt hash: " + hash);
```

Then update the database with the generated hash.

### Solution 3: Use Password Reset Endpoint (If Available)

I've added a password reset method to `UserService`. You can create a temporary endpoint to reset passwords:

**Add to TeacherController or create a temporary AuthHelperController:**

```java
@PostMapping("/admin/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
    try {
        String username = request.get("username");
        String newPassword = request.get("password");
        
        if (username == null || newPassword == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Username and password are required");
            return ResponseEntity.badRequest().body(error);
        }
        
        boolean success = userService.resetPassword(username, newPassword);
        
        if (success) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Failed to reset password: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

**⚠️ SECURITY WARNING:** Remove this endpoint after fixing your password! It's a temporary solution.

### Solution 4: Check Password Encoding During Registration

Make sure your registration endpoint encodes passwords correctly:

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody User registerRequest) {
    // ... validation ...
    
    // ✅ CRITICAL: Encode password before saving
    String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
    registerRequest.setPassword(encodedPassword);
    
    // Save user (password is already encoded)
    User savedUser = userService.createUser(registerRequest);
    
    // ... rest of code ...
}
```

## Debug Steps

### Step 1: Check Debug Logs

After adding the debug logging to `UserService.loadUserByUsername()`, try logging in again and check the console output. You should see:

```
🔍 Authenticated user: Namrata1805 | Role: TEACHER
🔐 Password prefix in DB: $2a$10$N9qo8uLOickgx2ZMRZoMy...
🔐 Password length: 60
🔐 Is BCrypt format: true
```

**If you see:**
- `Password length: 0` or very short → Password is not stored correctly
- `Is BCrypt format: false` → Password needs to be re-encoded
- Password starts with something other than `$2` → Password is not BCrypt encoded

### Step 2: Verify PasswordEncoder Configuration

Make sure your SecurityConfig has the same PasswordEncoder used during registration:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userService);
    authProvider.setPasswordEncoder(passwordEncoder()); // ✅ Must use same encoder
    return authProvider;
}
```

### Step 3: Test Password Encoding

Create a test endpoint to verify password encoding works:

```java
@GetMapping("/test-password")
public ResponseEntity<?> testPassword(@RequestParam String password) {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    String encoded = encoder.encode(password);
    boolean matches = encoder.matches(password, encoded);
    
    Map<String, Object> result = new HashMap<>();
    result.put("original", password);
    result.put("encoded", encoded);
    result.put("matches", matches);
    
    return ResponseEntity.ok(result);
}
```

Test: `GET http://localhost:8081/auth/test-password?password=test123`

## Most Common Causes

1. **Double Encoding**: Password encoded twice (once in AuthController, once in UserService)
   - ✅ Fixed: UserService.createUser() now doesn't encode (password already encoded)

2. **Plain Text Storage**: Password stored as plain text instead of encoded
   - ✅ Fix: Update password in database with BCrypt hash

3. **PasswordEncoder Mismatch**: Different encoder used for registration vs authentication
   - ✅ Fix: Ensure same PasswordEncoder bean used everywhere

4. **Password Changed After Registration**: Password updated incorrectly
   - ✅ Fix: Reset password using Solution 2 or 3

## Quick Fix (Recommended)

1. **Generate a new BCrypt hash** for your password using the test endpoint or Java code
2. **Update database directly**:
   ```sql
   UPDATE user 
   SET password = '$2a$10$YOUR_GENERATED_HASH_HERE' 
   WHERE username = 'Namrata1805';
   ```
3. **Try logging in** again with your original password

## After Fixing

1. Remove temporary password reset endpoints
2. Verify password encoding works for new registrations
3. Check that existing users can login

