// ===================================================================================
// COMPLETE BACKEND CODE FOR STUDENT CLASSES FEATURE
// Copy and paste into your backend project
// ===================================================================================

// ===================================================================================
// FILE 1: StudentController.java
// Location: src/main/java/com/elearnhub/teacher_service/Controller/StudentController.java
// ===================================================================================

package com.elearnhub.teacher_service.Controller;

import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.service.UserService;
import com.elearnhub.teacher_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    // ✅ Get enrolled classes for authenticated student
    @GetMapping("/classes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyClasses(Authentication authentication) {
        try {
            // Get student from authentication
            String username = authentication.getName();
            User student = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Get courses where this student is enrolled
            List<Course> enrolledCourses = courseService.getCoursesByStudentId(student.getId());

            // If no courses found, return empty list
            if (enrolledCourses == null || enrolledCourses.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            // Convert to response format
            List<Map<String, Object>> response = enrolledCourses.stream()
                    .map(course -> {
                        Map<String, Object> classData = new HashMap<>();
                        classData.put("id", course.getId());
                        classData.put("name", course.getName());
                        
                        // Add subject if available
                        if (course.getSubject() != null && !course.getSubject().trim().isEmpty()) {
                            classData.put("subject", course.getSubject());
                        }
                        
                        // Add description if available
                        if (course.getDescription() != null && !course.getDescription().trim().isEmpty()) {
                            classData.put("description", course.getDescription());
                        }
                        
                        // Get teacher information
                        if (course.getTeacherId() != null) {
                            try {
                                User teacher = userService.getUserById(course.getTeacherId())
                                        .orElse(null);
                                if (teacher != null) {
                                    // Use teacher's name if available, otherwise username
                                    String teacherName = teacher.getName() != null && !teacher.getName().trim().isEmpty()
                                            ? teacher.getName()
                                            : teacher.getUsername();
                                    classData.put("teacherName", teacherName);
                                    classData.put("teacherId", teacher.getId());
                                }
                            } catch (Exception e) {
                                // If teacher lookup fails, skip teacher info
                                System.err.println("Error fetching teacher for course " + course.getId() + ": " + e.getMessage());
                            }
                        }
                        
                        // Add student count
                        if (course.getStudents() != null) {
                            classData.put("students", course.getStudents().size());
                        } else {
                            classData.put("students", 0);
                        }
                        
                        return classData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

// ===================================================================================
// FILE 2: Add to CourseRepository.java
// Location: src/main/java/com/elearnhub/teacher_service/repository/CourseRepository.java
// Add this method to your existing CourseRepository interface
// ===================================================================================

/*
    // ✅ NEW: Find courses where student is enrolled (with eager fetch to avoid lazy init error)
    @EntityGraph(attributePaths = "students")
    @Query("SELECT DISTINCT c FROM Course c JOIN c.students s WHERE s.id = :studentId")
    List<Course> findByStudentsId(@Param("studentId") Long studentId);
*/

// Required imports (add if not present):
// import org.springframework.data.jpa.repository.EntityGraph;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// ===================================================================================
// FILE 3: Add to CourseService.java
// Location: src/main/java/com/elearnhub/teacher_service/service/CourseService.java
// Add this method to your existing CourseService class
// ===================================================================================

/*
    // ✅ NEW: Get courses by student ID (for student enrolled classes)
    public List<Course> getCoursesByStudentId(Long studentId) {
        // This eagerly fetches students collection using @EntityGraph
        List<Course> courses = courseRepository.findByStudentsId(studentId);
        
        // Initialize students if null (defensive programming)
        if (courses != null) {
            for (Course course : courses) {
                if (course.getStudents() == null) {
                    course.setStudents(new ArrayList<>());
                }
            }
        }
        
        return courses;
    }
*/

// Required imports (add if not present):
// import java.util.ArrayList;

// ===================================================================================
// VERIFICATION CHECKLIST
// ===================================================================================
// ✅ UserService.getUserById() exists (already present in your code)
// ✅ Course entity has @ManyToMany with User (students field)
// ✅ Database has join table for course-student relationship
// ✅ CourseRepository has findByStudentsId method
// ✅ CourseService has getCoursesByStudentId method
// ✅ StudentController is created
// ===================================================================================

// ===================================================================================
// IMPORTANT: Database Setup
// ===================================================================================
// Make sure your Course entity has ManyToMany relationship:
//
// @Entity
// public class Course {
//     ...
//     @ManyToMany
//     @JoinTable(
//         name = "course_student",
//         joinColumns = @JoinColumn(name = "course_id"),
//         inverseJoinColumns = @JoinColumn(name = "student_id")
//     )
//     private List<User> students;
//     ...
// }
//
// This creates a join table that links courses to enrolled students.
// ===================================================================================

// ===================================================================================
// TESTING
// ===================================================================================
// 1. Login as student: POST /auth/login
// 2. Get token from response
// 3. Test endpoint:
//    GET http://localhost:8082/student/classes
//    Headers: Authorization: Bearer <studentToken>
//
// Expected: Returns array of enrolled classes or empty array []
// ===================================================================================

