package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.CourseDTO;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.repository.CourseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    // ✅ Create course
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    // ✅ Get course by ID - returns Optional<Course> for controller
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    // ✅ Get courses by teacher ID - matches controller method name
    public List<Course> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    // ✅ Get all courses (if needed)
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(course -> new CourseDTO(
                        course.getId(),
                        course.getName(),
                        course.getDescription(),
                        course.getTeacherId()
                ))
                .collect(Collectors.toList());
    }

    // ✅ Get course DTO by ID (if needed for other services)
    public CourseDTO getCourseDTOById(Long id) {
        Optional<Course> course = courseRepository.findById(id);
        return course.map(c -> new CourseDTO(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getTeacherId()
        )).orElse(null);
    }

    // ✅ Update course
    public Course updateCourse(Long id, Course course) {
        Optional<Course> existingCourse = courseRepository.findById(id);
        if (existingCourse.isPresent()) {
            Course updatedCourse = existingCourse.get();
            updatedCourse.setName(course.getName());
            updatedCourse.setDescription(course.getDescription());
            updatedCourse.setTeacherId(course.getTeacherId());
            return courseRepository.save(updatedCourse);
        }
        throw new RuntimeException("Course not found with id: " + id);
    }

    // ✅ Delete course
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}

