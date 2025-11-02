package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.LessonDTO;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.Lesson;
import com.elearnhub.teacher_service.repository.LessonRepository;
import com.elearnhub.teacher_service.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    // File upload directory - configure this in application.properties
    @Value("${file.upload-dir:uploads/lessons}")
    private String uploadDir;

    public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) throws IOException {
        // ✅ FIXED: Find Course instead of ClassEntity
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Save file
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);
        
        // Create directory if it doesn't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create Lesson entity
        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setFilePath("/lessons/" + fileName); // Store relative path or full URL
        lesson.setCourse(course); // ✅ Use Course instead of ClassEntity

        Lesson savedLesson = lessonRepository.save(lesson);
        return convertToDTO(savedLesson);
    }

    public List<LessonDTO> getLessonsByClass(Long courseId) {
        // ✅ FIXED: Find lessons by Course instead of ClassEntity
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        List<Lesson> lessons = lessonRepository.findByCourse(course);
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

