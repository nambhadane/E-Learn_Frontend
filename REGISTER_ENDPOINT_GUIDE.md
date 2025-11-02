# Register Endpoint Implementation Guide

## Current Issue

Your `UserController` has a `createUser` endpoint at `/users`, but it:
- ❌ Requires authentication (`@PreAuthorize("hasRole('TEACHER')")`)
- ❌ Is at wrong path (`/users` instead of `/auth/register`)
- ❌ Returns User object instead of simple response

## Solution: Add Register Endpoint to AuthController

Add the register endpoint to your `AuthController` (same file as login):

### Complete AuthController with Register Endpoint

```java
package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.UserService;
import com.elearnhub.teacher_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.User) authentication.getPrincipal());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User registerRequest) {
        try {
            // Validate required fields
            if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Username is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if username already exists
            if (userService.existsByUsername(registerRequest.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Username already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Check if email already exists (optional, if you have this method)
            // if (userService.existsByEmail(registerRequest.getEmail())) {
            //     Map<String, String> error = new HashMap<>();
            //     error.put("message", "Email already exists");
            //     return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            // }

            // Set default role to "TEACHER" if not provided
            if (registerRequest.getRole() == null || registerRequest.getRole().trim().isEmpty()) {
                registerRequest.setRole("TEACHER");
            }

            // Encode password before saving
            String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
            registerRequest.setPassword(encodedPassword);

            // Save user
            User savedUser = userService.createUser(registerRequest);

            // Return success response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration successful");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Inner class for login response
    public static class JwtResponse {
        private String token;

        public JwtResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }
}
```

## Additional: Update UserService (if needed)

Make sure your `UserService` has an `existsByUsername` method. If not, add this to your UserRepository:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);  // ✅ Add this
    // Optional: boolean existsByEmail(String email);
}
```

If you're using a custom UserService method, make sure it checks for existing users:

```java
public boolean existsByUsername(String username) {
    return userRepository.existsByUsername(username);
}
```

## Security Configuration Update

Your SecurityConfig should already have `/auth/register` in `permitAll()`:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/login", "/auth/register").permitAll()  // ✅ Should be here
    // ... rest of your config
)
```

## Frontend Compatibility

The frontend expects:
- **Request:** `{ username: string, password: string, email?: string, name?: string }`
- **Response on success:** `{ message: string }` (Status 201)
- **Response on error:** `{ message: string }` (Status 400/409/500)

Your register endpoint matches this! ✅

## Testing

1. **Test successful registration:**
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newteacher","password":"password123","email":"teacher@example.com","role":"TEACHER"}'
```

Expected response (201):
```json
{
  "message": "Registration successful"
}
```

2. **Test duplicate username:**
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"existinguser","password":"password123","email":"test@example.com"}'
```

Expected response (409):
```json
{
  "message": "Username already exists"
}
```

3. **Test missing fields:**
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```

Expected response (400):
```json
{
  "message": "Password is required"
}
```

## Summary

✅ **What you need to do:**

1. **Add register endpoint** to your `AuthController` (see code above)
2. **Add dependencies** to AuthController:
   - `UserService` (already autowired)
   - `PasswordEncoder` (add if not already there)
3. **Add `existsByUsername` method** to UserRepository/UserService (if not exists)
4. **Verify SecurityConfig** allows `/auth/register` without authentication
5. **Test** registration from frontend

The register endpoint is now ready to work with your frontend! 🎉

