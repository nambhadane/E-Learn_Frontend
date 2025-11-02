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
    // Using explicit query with proper join syntax
    @EntityGraph(attributePaths = "students")
    @Query("SELECT DISTINCT c FROM Course c INNER JOIN c.students s WHERE s.id = :studentId")
    List<Course> findCoursesByStudentId(@Param("studentId") Long studentId);
    
    // Alternative method name (if above doesn't work, use this):
    // @Query("SELECT DISTINCT c FROM Course c JOIN c.students s WHERE s.id = :studentId")
    // @EntityGraph(attributePaths = "students")
    // List<Course> findByStudents_Id(@Param("studentId") Long studentId);
}

