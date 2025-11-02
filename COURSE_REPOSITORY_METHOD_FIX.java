package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // ✅ Option 1: Using @EntityGraph to fetch students eagerly
    @EntityGraph(attributePaths = "students")
    List<Course> findByTeacherId(Long teacherId);
    
    // ✅ Option 2: Using JOIN FETCH query (alternative approach)
    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.students WHERE c.teacherId = :teacherId")
    List<Course> findByTeacherIdWithStudents(@Param("teacherId") Long teacherId);
    
    // ✅ FIXED: Find courses where student is enrolled
    // Try this method name - it's more explicit and avoids conflicts
    @EntityGraph(attributePaths = "students")
    @Query("SELECT DISTINCT c FROM Course c INNER JOIN c.students s WHERE s.id = :studentId")
    List<Course> findCoursesByStudentId(@Param("studentId") Long studentId);
    
    // ALTERNATIVE: If above doesn't work, try without @EntityGraph (we'll add it in service)
    // @Query("SELECT DISTINCT c FROM Course c INNER JOIN c.students s WHERE s.id = :studentId")
    // List<Course> findCoursesByStudentId(@Param("studentId") Long studentId);
}

// ===================================================================================
// IMPORTANT: Also update CourseService.java
// Make sure CourseService.getCoursesByStudentId() uses the SAME method name
// ===================================================================================

// In CourseService.java, make sure you have:
/*
    public List<Course> getCoursesByStudentId(Long studentId) {
        // Use the EXACT method name from repository
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
*/

