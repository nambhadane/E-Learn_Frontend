# Add Download & View Endpoints to LessonController

## What to Add

Add these two methods to your existing `LessonController.java`:

### 1. Download Endpoint

```java
// ✅ Download file endpoint
@GetMapping("/{lessonId}/download")
@PreAuthorize("hasRole('TEACHER')")
public ResponseEntity<?> downloadLesson(
        @PathVariable Long lessonId,
        Authentication authentication) {
    try {
        // Get authenticated teacher
        String username = authentication.getName();
        User teacher = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Find lesson
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);
        if (lessonOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Lesson not found with id: " + lessonId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Lesson lesson = lessonOptional.get();

        // Verify lesson belongs to teacher's course
        if (lesson.getCourse() == null || !lesson.getCourse().getTeacherId().equals(teacher.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized: Lesson does not belong to this teacher");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        // Get file path
        String filePath = lesson.getFilePath();
        Path file = Paths.get(filePath);
        
        // Check if file exists
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "File not found: " + filePath);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        // Get file resource
        Resource resource = new FileSystemResource(file);

        // Determine content type
        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Get original filename from filePath
        String originalFileName = file.getFileName().toString();
        // Remove timestamp prefix if present (format: timestamp_originalname)
        if (originalFileName.contains("_")) {
            originalFileName = originalFileName.substring(originalFileName.indexOf("_") + 1);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + originalFileName + "\"")
                .body(resource);

    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Failed to download file: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### 2. View Endpoint

```java
// ✅ View file endpoint (inline, for PDFs, images, etc.)
@GetMapping("/{lessonId}/view")
@PreAuthorize("hasRole('TEACHER')")
public ResponseEntity<?> viewLesson(
        @PathVariable Long lessonId,
        Authentication authentication) {
    try {
        // Get authenticated teacher
        String username = authentication.getName();
        User teacher = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Find lesson
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);
        if (lessonOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Lesson not found with id: " + lessonId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Lesson lesson = lessonOptional.get();

        // Verify lesson belongs to teacher's course
        if (lesson.getCourse() == null || !lesson.getCourse().getTeacherId().equals(teacher.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized: Lesson does not belong to this teacher");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        // Get file path
        String filePath = lesson.getFilePath();
        Path file = Paths.get(filePath);
        
        // Check if file exists
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "File not found: " + filePath);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        // Get file resource
        Resource resource = new FileSystemResource(file);

        // Determine content type
        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Return file inline (for viewing in browser)
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);

    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Failed to view file: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

## Required Imports

Add these imports to your `LessonController`:

```java
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
```

## Required Repository Injection

Make sure you have `LessonRepository` injected:

```java
@Autowired
private LessonRepository lessonRepository;
```

## Security Configuration

Make sure these endpoints are accessible in your `SecurityConfig`:

The endpoints are already protected by `@PreAuthorize("hasRole('TEACHER')")`, so they should work with your existing security setup.

## Testing

After adding these endpoints:
1. Restart Spring Boot
2. Go to Notes page
3. Click "View" to open file in browser
4. Click "Download" to download file

Both should work now! ✅

