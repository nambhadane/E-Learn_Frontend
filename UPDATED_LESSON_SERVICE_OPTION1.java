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
        Files.copy(file.getInputStream(), filePath);

        // Create and save lesson with Course
        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setFilePath(UPLOAD_DIR + fileName); // Store relative path
        lesson.setCourse(course); // ✅ Use Course instead of ClassEntity
        
        Lesson savedLesson = lessonRepository.save(lesson);

        return new LessonDTO(savedLesson.getId(), savedLesson.getTitle(), savedLesson.getFilePath(), courseId);
    }

    // ✅ FIXED: Find lessons by Course
    public List<LessonDTO> getLessonsByClass(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        List<Lesson> lessons = lessonRepository.findByCourse(course); // ✅ Changed from findByClassEntityId
        return lessons.stream()
                .map(l -> new LessonDTO(l.getId(), l.getTitle(), l.getFilePath(), courseId))
                .collect(Collectors.toList());
    }
}

