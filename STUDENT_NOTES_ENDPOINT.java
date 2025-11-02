// ===================================================================================
// ADD THESE METHODS TO YOUR LessonController.java
// Location: src/main/java/com/elearnhub/teacher_service/Controller/LessonController.java
// ===================================================================================

// REQUIRED IMPORTS (add if not already present):
// import com.elearnhub.teacher_service.entity.Lesson;
// import com.elearnhub.teacher_service.repository.LessonRepository;
// import org.springframework.core.io.FileSystemResource;
// import org.springframework.core.io.Resource;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.MediaType;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;

// ===================================================================================
// METHOD 1: Get lessons by class for students (validates enrollment)
// ===================================================================================

    // ✅ NEW: Get lessons by class for students (validates enrollment)
    @GetMapping("/student/class/{classId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getLessonsByClassForStudent(
            @PathVariable Long classId,
            Authentication authentication) {
        try {
            // Get authenticated student
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Verify course exists
            Optional<Course> courseOptional = courseService.getCourseById(classId);
            
            if (courseOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Course not found with id: " + classId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Course course = courseOptional.get();
            
            // Verify student is enrolled in this course
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());
            boolean isEnrolled = enrolledCourses.stream()
                    .anyMatch(enrolledCourse -> enrolledCourse.getId().equals(course.getId()));
            
            if (!isEnrolled) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You are not enrolled in this course");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Get lessons for this course
            List<LessonDTO> lessons = lessonService.getLessonsByClass(classId);
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch lessons: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

// ===================================================================================
// METHOD 2: Download lesson for students (modify existing or add new)
// ===================================================================================

    // ✅ MODIFY EXISTING download endpoint OR ADD THIS NEW ONE for students:
    // Option A: Modify existing endpoint to allow both TEACHER and STUDENT:
    // Change: @PreAuthorize("hasRole('TEACHER')") 
    // To: @PreAuthorize("hasRole('TEACHER') or hasRole('STUDENT')")
    // Then update the authorization check inside to handle both roles
    
    // Option B: Add separate student endpoint:
    @GetMapping("/student/{lessonId}/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> downloadLessonForStudent(
            @PathVariable Long lessonId,
            Authentication authentication) {
        try {
            // Get authenticated student
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Find lesson
            Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);
            if (lessonOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Lesson not found with id: " + lessonId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Lesson lesson = lessonOptional.get();

            // Verify lesson's course exists
            if (lesson.getCourse() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Lesson course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify student is enrolled in the lesson's course
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());
            boolean isEnrolled = enrolledCourses.stream()
                    .anyMatch(enrolledCourse -> enrolledCourse.getId().equals(lesson.getCourse().getId()));
            
            if (!isEnrolled) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You are not enrolled in this course");
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

// ===================================================================================
// METHOD 3: View lesson for students (modify existing or add new)
// ===================================================================================

    // ✅ MODIFY EXISTING view endpoint OR ADD THIS NEW ONE for students:
    @GetMapping("/student/{lessonId}/view")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> viewLessonForStudent(
            @PathVariable Long lessonId,
            Authentication authentication) {
        try {
            // Get authenticated student
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Find lesson
            Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);
            if (lessonOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Lesson not found with id: " + lessonId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Lesson lesson = lessonOptional.get();

            // Verify lesson's course exists
            if (lesson.getCourse() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Lesson course not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify student is enrolled in the lesson's course
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());
            boolean isEnrolled = enrolledCourses.stream()
                    .anyMatch(enrolledCourse -> enrolledCourse.getId().equals(lesson.getCourse().getId()));
            
            if (!isEnrolled) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You are not enrolled in this course");
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

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to view file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

// ===================================================================================
// IMPORTANT NOTES:
// ===================================================================================
// 1. This endpoint is at /lessons/student/class/{classId} (different from teacher endpoint)
// 2. Make sure CourseService has getCoursesByStudentId() method
// 3. The endpoints validate that the student is enrolled before returning/accessing lessons
// 4. Frontend has been updated to use these endpoints
// 5. Make sure LessonRepository is autowired in LessonController
// 6. Alternative: You can modify existing download/view endpoints to allow both roles
//    by changing @PreAuthorize to allow both and adding role-based authorization checks
// ===================================================================================

