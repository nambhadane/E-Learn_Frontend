package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.dto.LessonDTO;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.service.LessonService;
import com.elearnhub.teacher_service.service.CourseService;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // ✅ FIXED: Use courseId instead of classId, and find Course first
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> uploadLesson(
            @RequestParam Long classId, // This is actually a Course ID from frontend
            @RequestParam String title,
            @RequestParam(required = false) String content, // Make content optional
            @RequestPart MultipartFile file,
            Authentication authentication) throws IOException {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Find Course by ID (frontend sends Course ID)
            Optional<Course> courseOptional = courseService.getCourseById(classId);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found with id: " + classId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();

            // Verify course belongs to teacher
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Call LessonService - it should handle creating/finding ClassEntity from Course
            // OR update LessonService to work with Course directly
            LessonDTO lessonDTO = lessonService.uploadLesson(classId, title, file);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(lessonDTO);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload lesson: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getLessonsByClass(
            @PathVariable Long classId,
            Authentication authentication) {
        try {
            // Get authenticated teacher
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify course exists and belongs to teacher
            Optional<Course> courseOptional = courseService.getCourseById(classId);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found with id: " + classId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();
            
            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: Course does not belong to this teacher");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            List<LessonDTO> lessons = lessonService.getLessonsByClass(classId);
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch lessons: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

