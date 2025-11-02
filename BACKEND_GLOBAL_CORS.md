# Global CORS Configuration (Option B) - Step by Step Guide

## Step 1: Create CORS Configuration Class

Create a new file in your Spring Boot project:

**File Location:** `src/main/java/com/elearnhub/teacher_service/config/CorsConfig.java`

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
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Step 2: Update Your AuthController

**Remove** any `@CrossOrigin` annotations from individual controllers since we're using global config:

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
// NO @CrossOrigin annotation needed here - using global config
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

## Step 3: Verify Security Configuration

Make sure your SecurityConfig allows CORS and has proper configuration:

```java
package com.elearnhub.teacher_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())  // Enable CORS
            .and()
            .csrf().disable()  // Disable CSRF for REST API (or configure properly)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/auth/register").permitAll()  // Allow login/register
                .anyRequest().authenticated()  // All other requests need authentication
            )
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);  // Stateless for JWT
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## Step 4: Verify Your User Entity Matches

Your User entity looks good! ✅ It has:
- `username` ✅
- `password` ✅
- `email` ✅
- `role` (as String) ✅

The frontend sends:
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

This matches what your `AuthController` expects in the `login()` method. Perfect!

## Step 5: Test CORS Configuration

After implementing the above:

1. **Restart your Spring Boot application**
2. **Test with browser:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try logging in from frontend
   - Check for CORS errors in console

3. **Test with curl (to verify backend works):**
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"username":"testuser","password":"testpass"}'
```

Should return: `{"token":"your-jwt-token"}`

4. **Test CORS preflight (OPTIONS request):**
```bash
curl -X OPTIONS http://localhost:8081/auth/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

Should return 200 with CORS headers.

## Troubleshooting

### Issue: Still getting CORS errors
**Solutions:**
1. Make sure you **restarted** your Spring Boot application after adding CorsConfig
2. Check that `CorsConfig` is in the correct package and is being scanned
3. Verify SecurityConfig allows CORS (Step 3 above)
4. Check browser console for exact error message

### Issue: CORS works but authentication fails
**Solutions:**
1. Verify username and password are correct
2. Check AuthenticationManager is properly configured
3. Verify UserDetailsService is loading users correctly

### Issue: 404 Not Found
**Solutions:**
1. Verify controller has `@RequestMapping("/auth")`
2. Verify endpoint has `@PostMapping("/login")`
3. Check backend is running on port 8081
4. Verify no other mapping conflicts

## Summary

✅ **What you need to do:**

1. **Create** `CorsConfig.java` in `com.elearnhub.teacher_service.config` package
2. **Add** CORS configuration to your `SecurityConfig` (if you have one)
3. **Restart** your Spring Boot application
4. **Test** the connection from frontend

**Your User entity is already perfect** - no changes needed! ✅

The frontend will send:
```json
{
  "username": "...",
  "password": "..."
}
```

And your backend will accept it and return:
```json
{
  "token": "..."
}
```

Everything should work! 🎉

