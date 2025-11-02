# Backend Setup Guide for Frontend Integration

This guide shows you exactly what changes to make in your Spring Boot backend to connect with the frontend.

## Required Backend Changes

### 1. CORS Configuration (REQUIRED)

You need to enable CORS in your Spring Boot backend to allow requests from your frontend (running on `http://localhost:8080`).

**Option A: Add `@CrossOrigin` annotation to your `AuthController`:**

```java
package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:8080")  // Add this line
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.User) authentication.getPrincipal());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    // Inner class for response
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

**Option B: Global CORS Configuration (RECOMMENDED for multiple controllers):**

Create a new configuration class:

```java
package com.elearnhub.teacher_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2. Verify Your User Entity Structure

Make sure your `User` entity class has `username` and `password` fields that match what the frontend sends:

```java
public class User {
    private String username;
    private String password;
    
    // Getters and setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
```

### 3. Verify Response Format

Your `JwtResponse` class already returns `{ "token": "..." }` which matches what the frontend expects. ✅

## Optional: Additional Endpoints

### 4. Register Endpoint (Optional)

If you want to enable registration from the frontend, add this to your `AuthController`:

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody User registerRequest) {
    // Your registration logic here
    // Create user, save to database, etc.
    
    // After successful registration, you can return:
    // Option 1: Just a success message
    return ResponseEntity.ok(Map.of("message", "Registration successful"));
    
    // Option 2: Or auto-login and return token
    // Authentication authentication = authenticationManager.authenticate(...);
    // String token = jwtUtil.generateToken(...);
    // return ResponseEntity.ok(new JwtResponse(token));
}
```

**Don't forget to add CORS if using Option A:**
```java
@CrossOrigin(origins = "http://localhost:8080")
@PostMapping("/register")
```

### 5. Profile Endpoint (Optional - for getting teacher details)

If you want the frontend to fetch teacher profile details after login:

```java
@RestController
@RequestMapping("/teacher")
@CrossOrigin(origins = "http://localhost:8080")  // Add CORS
public class TeacherController {

    @Autowired
    private UserService userService;  // Your service to get user details

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        // Get username from authentication
        String username = authentication.getName();
        
        // Fetch user details from database
        User user = userService.findByUsername(username);
        
        // Return user profile
        Map<String, Object> profile = Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "name", user.getName() != null ? user.getName() : "",
            "email", user.getEmail() != null ? user.getEmail() : ""
        );
        
        return ResponseEntity.ok(profile);
    }
}
```

**Note:** Make sure this endpoint is secured and requires authentication (JWT token validation).

### 6. Security Configuration

Make sure your Spring Security configuration:

1. **Allows `/auth/login` and `/auth/register` without authentication:**
```java
http.authorizeRequests()
    .antMatchers("/auth/login", "/auth/register").permitAll()
    .anyRequest().authenticated();
```

2. **Allows OPTIONS requests for CORS:**
```java
http.cors().and().csrf().disable();  // or configure CSRF properly
```

## Testing Checklist

After making these changes:

1. ✅ Start your Spring Boot backend on port `8081`
2. ✅ Verify CORS is configured (check browser console for CORS errors)
3. ✅ Test login endpoint with Postman/curl:
   ```bash
   curl -X POST http://localhost:8081/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass"}'
   ```
4. ✅ Should return: `{"token":"your-jwt-token"}`
5. ✅ Frontend should now be able to connect!

## Common Issues and Solutions

### Issue 1: CORS Error in Browser
**Solution:** Make sure you've added CORS configuration (Step 1 above)

### Issue 2: 401 Unauthorized
**Solution:** Check that:
- Username and password are correct
- AuthenticationManager is properly configured
- User exists in your database

### Issue 3: 404 Not Found
**Solution:** Verify:
- Your controller has `@RequestMapping("/auth")`
- Login endpoint has `@PostMapping("/login")`
- Backend is running on port 8081

### Issue 4: Response format error
**Solution:** Ensure `JwtResponse` returns `{ "token": "..." }` format exactly

## Summary

**Minimum required changes:**
1. ✅ Add `@CrossOrigin(origins = "http://localhost:8080")` to your `AuthController`
   OR
   ✅ Add global CORS configuration

**That's it!** Your backend should now work with the frontend for login.

For registration and profile endpoints, add them as needed using the examples above.

