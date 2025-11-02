package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public Course createCourse(Course course) {
        // Initialize students list if null to avoid NPE
        if (course.getStudents() == null) {
            course.setStudents(new ArrayList<>());
        }
        return courseRepository.save(course);
    }

    // ✅ Updated: Use repository method that eagerly fetches students
    public List<Course> getCoursesByTeacherId(Long teacherId) {
        // This will eagerly fetch students collection, preventing lazy initialization error
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        
        // Initialize students if null (defensive programming)
        for (Course course : courses) {
            if (course.getStudents() == null) {
                course.setStudents(new ArrayList<>());
            }
        }
        
        return courses;
    }

    // ✅ Updated: Eagerly fetch students when getting by ID
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id).map(course -> {
            // Initialize students if null
            if (course.getStudents() == null) {
                course.setStudents(new ArrayList<>());
            }
            // Force initialization of students collection within transaction
            course.getStudents().size(); // This triggers lazy loading within transaction
            return course;
        });
    }

    public Course updateCourse(Long id, Course course) {
        Optional<Course> existingCourse = courseRepository.findById(id);
        if (existingCourse.isPresent()) {
            Course updatedCourse = existingCourse.get();
            updatedCourse.setName(course.getName());
            updatedCourse.setDescription(course.getDescription());
            updatedCourse.setTeacherId(course.getTeacherId());
            // Don't update students list here (that's handled separately)
            return courseRepository.save(updatedCourse);
        }
        throw new RuntimeException("Course not found with id: " + id);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}

