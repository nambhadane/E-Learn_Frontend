// ===================================================================================
// FIX FOR ASSIGNMENT SUBMISSION CONTROLLER
// Location: src/main/java/com/elearnhub/teacher_service/Controller/AssignmentController.java
// ===================================================================================

// REPLACE the existing saveSubmission method (lines 152-166) with this updated version:

    // ✅ FIXED: Save submission (for students) - extracts studentId from authentication and supports file uploads
    @PostMapping(value = "/submissions", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveSubmission(
            @RequestPart(required = false) SubmissionDTO submissionDTO,
            @RequestPart(required = false) List<MultipartFile> files,
            @RequestParam(required = false) Long assignmentId,
            @RequestParam(required = false) String content,
            Authentication authentication) {
        try {
            // Get authenticated student
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Handle both JSON and form-data requests
            SubmissionDTO finalSubmissionDTO;
            if (submissionDTO != null) {
                // JSON request
                finalSubmissionDTO = submissionDTO;
            } else {
                // Form-data request
                finalSubmissionDTO = new SubmissionDTO();
                finalSubmissionDTO.setAssignmentId(assignmentId);
                finalSubmissionDTO.setContent(content);
            }
            
            // ✅ CRITICAL FIX: Set studentId from authenticated user (not from request)
            finalSubmissionDTO.setStudentId(student.getId());
            
            // Validate assignmentId is provided
            if (finalSubmissionDTO.getAssignmentId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Assignment ID is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Handle file uploads if provided
            if (files != null && !files.isEmpty()) {
                try {
                    // ✅ FIXED: Use proper file path handling (similar to LessonService)
                    // Option 1: Save to user home directory (more reliable, works everywhere)
                    String uploadDir = System.getProperty("user.home") + File.separator + "uploads" + File.separator + "submissions" + File.separator;
                    
                    // Option 2: Use project directory (relative to where JAR runs)
                    // String uploadDir = "uploads" + File.separator + "submissions" + File.separator;
                    
                    // Option 3: Use @Value annotation (RECOMMENDED - see ALTERNATIVE_SUBMISSION_UPLOAD_PATH.java)
                    // @Value("${file.submission-upload-dir:${user.home}/uploads/submissions}")
                    // private String submissionUploadDir;
                    // Then use: String uploadDir = submissionUploadDir;
                    
                    // Create directory if it doesn't exist (handles Windows/Unix paths)
                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    
                    // Save files and get file paths
                    List<String> filePaths = new ArrayList<>();
                    for (MultipartFile file : files) {
                        if (!file.isEmpty()) {
                            // Generate unique filename with timestamp and UUID
                            String originalFilename = file.getOriginalFilename();
                            // Sanitize filename to remove special characters
                            String sanitizedFilename = originalFilename != null 
                                ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") 
                                : "file";
                            
                            String timestamp = String.valueOf(System.currentTimeMillis());
                            String uuid = UUID.randomUUID().toString().substring(0, 8);
                            String filename = timestamp + "_" + uuid + "_" + sanitizedFilename;
                            
                            // Save file using NIO Files API (more reliable)
                            Path filePath = uploadPath.resolve(filename);
                            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                            
                            // Store relative path or full path (adjust as needed)
                            filePaths.add("uploads/submissions/" + filename);
                        }
                    }
                    
                    // Store multiple file paths as comma-separated
                    if (!filePaths.isEmpty()) {
                        finalSubmissionDTO.setFilePath(String.join(",", filePaths));
                    }
                } catch (IOException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Failed to save file: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
                }
            }
            
            SubmissionDTO savedSubmission = assignmentService.saveSubmission(finalSubmissionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubmission);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to save submission: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

// ===================================================================================
// REQUIRED IMPORTS (add to AssignmentController.java if not present):
// ===================================================================================
// import org.springframework.http.MediaType;
// import org.springframework.web.multipart.MultipartFile;
// import java.io.IOException;
// import java.io.File;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.nio.file.StandardCopyOption;
// import java.util.ArrayList;
// import java.util.UUID;
// ===================================================================================
// 
// IMPORTANT NOTES:
// ===================================================================================
// 1. The studentId is now extracted from authentication (security improvement)
// 2. Supports both JSON (existing) and multipart/form-data (file uploads)
// 3. Files are saved to uploads/submissions/ directory
// 4. Multiple files are stored as comma-separated paths in filePath field
// 5. Adjust upload directory path according to your project structure
// 6. Make sure the uploads directory has write permissions
// ===================================================================================

