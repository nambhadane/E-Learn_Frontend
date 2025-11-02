// ===================================================================================
// ALTERNATIVE: CONFIGURABLE UPLOAD PATH (RECOMMENDED)
// ===================================================================================
// Instead of hardcoding the path, you can use @Value annotation like LessonService
// ===================================================================================

// Option 1: Add this field to your AssignmentController class:
@Value("${file.submission-upload-dir:${user.home}/uploads/submissions}")
private String submissionUploadDir;

// Then in the saveSubmission method, use:
// String uploadDir = submissionUploadDir;

// Option 2: If you want to save in the project directory (relative to where the JAR is):
// Add this field:
@Value("${file.submission-upload-dir:uploads/submissions}")
private String submissionUploadDir;

// And add this helper method to get absolute path:
private Path getUploadPath() throws IOException {
    Path uploadPath = Paths.get(submissionUploadDir);
    
    // If it's a relative path, make it absolute relative to project root
    if (!uploadPath.isAbsolute()) {
        // Try to get project root (where application.properties is)
        String projectRoot = System.getProperty("user.dir");
        uploadPath = Paths.get(projectRoot, submissionUploadDir);
    }
    
    // Create directories if they don't exist
    if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
    }
    
    return uploadPath;
}

// Then use it in saveSubmission:
// Path uploadPath = getUploadPath();

// ===================================================================================
// CONFIGURATION IN application.properties:
// ===================================================================================
// # For user home directory:
// file.submission-upload-dir=${user.home}/uploads/submissions
//
// # For project directory (relative):
// file.submission-upload-dir=uploads/submissions
//
// # For absolute path:
// file.submission-upload-dir=C:/uploads/submissions
// ===================================================================================
