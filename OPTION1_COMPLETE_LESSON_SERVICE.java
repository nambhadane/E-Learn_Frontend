package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.LessonDTO;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.Lesson;
import com.elearnhub.teacher_service.repository.CourseRepository;
import com.elearnhub.teacher_service.repository.LessonRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private CourseRepository courseRepository; // ✅ Changed from ClassEntityRepository

    private final String UPLOAD_DIR = "uploads/lessons/"; // Directory to store files

    // ✅ FIXED: Use Course instead of ClassEntity
    public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) throws IOException {
        // Find Course (frontend sends Course ID)
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file to disk
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create and save lesson with Course
        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setFilePath(UPLOAD_DIR + fileName); // Store relative path
        lesson.setCourse(course); // ✅ Use Course instead of ClassEntity
        
        Lesson savedLesson = lessonRepository.save(lesson);

        // Convert to DTO
        return convertToDTO(savedLesson);
    }

    // ✅ FIXED: Find lessons by Course
    public List<LessonDTO> getLessonsByClass(Long courseId) {
        // Verify Course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Find lessons by Course ID (more efficient than finding by Course object)
        List<Lesson> lessons = lessonRepository.findByCourseId(courseId);
        
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert Lesson to LessonDTO
    private LessonDTO convertToDTO(Lesson lesson) {
        LessonDTO dto = new LessonDTO();
        dto.setId(lesson.getId());
        dto.setTitle(lesson.getTitle());
        dto.setFilePath(lesson.getFilePath());
        if (lesson.getCourse() != null) {
            dto.setClassId(lesson.getCourse().getId()); // Return course ID as classId for frontend compatibility
        }
        return dto;
    }
}

