// ===================================================================================
// ADD THIS METHOD TO YOUR CourseService.java
// Location: src/main/java/com/elearnhub/teacher_service/service/CourseService.java
// ===================================================================================

// Add this method to your existing CourseService class:

    // ✅ NEW: Get courses by student ID (for student enrolled classes)
    // Add this method after your existing methods
    public List<Course> getCoursesByStudentId(Long studentId) {
        // This eagerly fetches students collection using @EntityGraph
        List<Course> courses = courseRepository.findCoursesByStudentId(studentId);
        
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

// ===================================================================================
// IMPORTANT NOTES:
// ===================================================================================
// 1. Make sure CourseRepository has findCoursesByStudentId() method (not findByStudentsId)
// 2. The method name in CourseService (getCoursesByStudentId) matches the repository call
// 3. Make sure you have: import java.util.ArrayList;
// ===================================================================================

