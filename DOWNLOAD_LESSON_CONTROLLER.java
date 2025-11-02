package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.Lesson;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.repository.LessonRepository;
import com.elearnhub.teacher_service.service.CourseService;
import com.elearnhub.teacher_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/lessons")
public class LessonController {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

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
}

