# Fix: "No static resource lessons" Error

## Problem

Spring Boot is treating `/lessons` as a static resource instead of routing to your controller. This happens when:

1. Controller class is not being scanned
2. Controller is missing `@RestController` annotation
3. Package is not in component scan path
4. Controller file has compilation errors

## Solution

### Step 1: Verify Your Controller Location

Your `LessonController` should be in a package that's under your main application package:

```
com.elearnhub.teacher_service
├── TeacherServiceApplication.java  (main class)
└── Controller
    └── LessonController.java  ✅ Should be here
```

### Step 2: Verify Controller Has All Annotations

Make sure your `LessonController.java` has:

```java
@RestController  // ✅ CRITICAL - Must have this!
@RequestMapping("/lessons")
public class LessonController {
    // ...
}
```

### Step 3: Use Complete Controller

Replace your entire `LessonController.java` with the code from:
**`COMPLETE_LESSON_CONTROLLER_WITH_DOWNLOAD.java`**

This file contains:
- ✅ `@RestController` annotation
- ✅ Upload endpoint
- ✅ Get lessons endpoint  
- ✅ Download endpoint
- ✅ View endpoint
- ✅ All required imports

### Step 4: Verify Package Name

Make sure the package declaration matches your file location:

```java
package com.elearnhub.teacher_service.Controller;  // Match your actual package
```

### Step 5: Check Component Scan

In your `TeacherServiceApplication.java`, make sure component scan includes your package:

```java
@SpringBootApplication
// If you have custom scan, make sure it includes your controller package
// @ComponentScan(basePackages = "com.elearnhub.teacher_service")
public class TeacherServiceApplication {
    // ...
}
```

### Step 6: Clean and Rebuild

1. **Stop Spring Boot**
2. **Clean project:**
   ```bash
   mvn clean
   # OR if using Gradle
   ./gradlew clean
   ```
3. **Rebuild:**
   ```bash
   mvn compile
   # OR
   ./gradlew build
   ```
4. **Restart Spring Boot**

### Step 7: Verify Controller is Loaded

After restart, check the logs for:
```
Mapped "{[/lessons]}" onto ...
```

If you see this, the controller is loaded correctly.

## Quick Checklist

- [ ] Controller has `@RestController` annotation
- [ ] Controller has `@RequestMapping("/lessons")` 
- [ ] Package name is correct
- [ ] File is in correct location under main package
- [ ] No compilation errors
- [ ] Cleaned and rebuilt project
- [ ] Restarted Spring Boot

## If Still Not Working

### Check if Controller is Being Scanned

Add this temporary logging to see if controller is being found:

```java
@RestController
@RequestMapping("/lessons")
public class LessonController {
    
    public LessonController() {
        System.out.println("✅ LessonController is being instantiated!");
    }
    
    // ... rest of code
}
```

If you don't see this message in logs, the controller is not being loaded.

### Verify Request Mapping

Try accessing: `http://localhost:8081/lessons/class/1` (GET request with authentication)

If this works but POST doesn't, there might be a routing priority issue.

## Common Issues

### Issue 1: Missing @RestController
**Symptom:** Spring treats endpoint as static resource
**Fix:** Add `@RestController` annotation

### Issue 2: Wrong Package
**Symptom:** Controller not found
**Fix:** Move controller to package under main application package

### Issue 3: Compilation Errors
**Symptom:** Controller class not loaded
**Fix:** Fix all compilation errors, clean and rebuild

### Issue 4: Static Resource Handler Takes Priority
**Symptom:** 404 with "No static resource"
**Fix:** Ensure controller has higher priority (usually automatic with @RestController)

---

**After applying these fixes, your download and view endpoints should work!**

