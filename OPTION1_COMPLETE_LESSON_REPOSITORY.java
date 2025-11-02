package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Lesson;
import com.elearnhub.teacher_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    // ✅ FIXED: Find by Course instead of ClassEntity
    List<Lesson> findByCourse(Course course);
    
    // Alternative: Find by course ID directly (more efficient)
    List<Lesson> findByCourseId(Long courseId);
}

