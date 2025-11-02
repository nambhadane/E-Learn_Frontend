// ===================================================================================
// BACKEND IMPLEMENTATION: Add Student to Course
// Copy this code into your backend files
// ===================================================================================

// ===================================================================================
// 1. Add to CourseController.java
// Location: src/main/java/com/elearnhub/teacher_service/Controller/CourseController.java
// ===================================================================================

/*
    // ✅ NEW: Add student to course
    @PostMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> addStudentToCourse(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify course exists and belongs to teacher
            Course course = courseService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You don't own this course");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Verify student exists
            User student = userService.getUserById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Verify student role
            if (!"STUDENT".equals(student.getRole())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User is not a student");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Add student to course
            courseService.addStudentToCourse(courseId, studentId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student added to course successfully");
            response.put("courseId", courseId);
            response.put("studentId", studentId);
            response.put("studentName", student.getName() != null ? student.getName() : student.getUsername());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to add student: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ NEW: Remove student from course
    @DeleteMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> removeStudentFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify course exists and belongs to teacher
            Course course = courseService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You don't own this course");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Remove student from course
            courseService.removeStudentFromCourse(courseId, studentId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student removed from course successfully");
            response.put("courseId", courseId);
            response.put("studentId", studentId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to remove student: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ NEW: Get all students in a course
    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourseStudents(
            @PathVariable Long courseId,
            Authentication authentication) {
        try {
            // Get teacher from authentication
            String username = authentication.getName();
            User teacher = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify course exists and belongs to teacher
            Course course = courseService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (!course.getTeacherId().equals(teacher.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized: You don't own this course");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Get students enrolled in course
            List<User> students = courseService.getCourseStudents(courseId);

            // Convert to response format
            List<Map<String, Object>> response = students.stream()
                    .map(student -> {
                        Map<String, Object> studentData = new HashMap<>();
                        studentData.put("id", student.getId());
                        studentData.put("username", student.getUsername());
                        studentData.put("name", student.getName() != null ? student.getName() : student.getUsername());
                        studentData.put("email", student.getEmail() != null ? student.getEmail() : "");
                        return studentData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch students: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
*/

// ===================================================================================
// 2. Add to CourseService.java
// Location: src/main/java/com/elearnhub/teacher_service/service/CourseService.java
// ===================================================================================

/*
    // ✅ NEW: Add student to course
    @Transactional
    public void addStudentToCourse(Long courseId, Long studentId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Initialize students list if null
        if (course.getStudents() == null) {
            course.setStudents(new ArrayList<>());
        }

        // Check if student is already enrolled
        boolean alreadyEnrolled = course.getStudents().stream()
                .anyMatch(student -> student.getId().equals(studentId));

        if (alreadyEnrolled) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        // Get student entity
        User student = userService.getUserById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Add student to course
        course.getStudents().add(student);
        courseRepository.save(course);

        System.out.println("✅ Student " + student.getUsername() + " added to course " + course.getName());
    }

    // ✅ NEW: Remove student from course
    @Transactional
    public void removeStudentFromCourse(Long courseId, Long studentId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();

        if (course.getStudents() == null || course.getStudents().isEmpty()) {
            throw new RuntimeException("No students enrolled in this course");
        }

        // Remove student from course
        boolean removed = course.getStudents().removeIf(student -> student.getId().equals(studentId));

        if (!removed) {
            throw new RuntimeException("Student is not enrolled in this course");
        }

        courseRepository.save(course);
        System.out.println("✅ Student removed from course " + course.getName());
    }

    // ✅ NEW: Get all students in a course
    public List<User> getCourseStudents(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();

        if (course.getStudents() == null) {
            return new ArrayList<>();
        }

        return new ArrayList<>(course.getStudents());
    }
*/

// ===================================================================================
// Required imports for CourseController:
// ===================================================================================
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;

// ===================================================================================
// Required imports for CourseService:
// ===================================================================================
// import com.elearnhub.teacher_service.entity.User;
// import com.elearnhub.teacher_service.service.UserService;
// Make sure UserService is autowired in CourseService:
// @Autowired
// private UserService userService;

// ===================================================================================

