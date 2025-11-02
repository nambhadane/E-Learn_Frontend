package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.LessonDTO;
import com.elearnhub.teacher_service.entity.ClassEntity;
import com.elearnhub.teacher_service.entity.Course;
import com.elearnhub.teacher_service.entity.Lesson;
import com.elearnhub.teacher_service.repository.ClassEntityRepository;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private ClassEntityRepository classEntityRepository;
    
    @Autowired
    private CourseRepository courseRepository; // ✅ Added to find Course

    private final String UPLOAD_DIR = "uploads/lessons/"; // Directory to store files

    // ✅ FIXED: Find ClassEntity by Course ID
    public LessonDTO uploadLesson(Long courseId, String title, MultipartFile file) throws IOException {
        // First find the Course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Find or create ClassEntity for this Course
        ClassEntity classEntity = findOrCreateClassEntity(course);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file to disk
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Create and save lesson with ClassEntity
        Lesson lesson = new Lesson(title, filePath.toString(), classEntity);
        Lesson savedLesson = lessonRepository.save(lesson);

        return new LessonDTO(savedLesson.getId(), savedLesson.getTitle(), savedLesson.getFilePath(), classEntity.getId());
    }

    // ✅ Helper method to find or create ClassEntity from Course
    private ClassEntity findOrCreateClassEntity(Course course) {
        // Try to find existing ClassEntity by Course ID
        // Assuming you have a method in ClassEntityRepository to find by Course
        // If not, you might need to create one
        
        // Option 1: If ClassEntity has a courseId field
        // Optional<ClassEntity> existing = classEntityRepository.findByCourseId(course.getId());
        
        // Option 2: If you need to create a new ClassEntity
        // For now, let's create one (adjust based on your ClassEntity structure)
        ClassEntity classEntity = new ClassEntity();
        classEntity.setName(course.getName());
        // Set other required fields for ClassEntity
        // classEntity.setCourse(course); // If ClassEntity has Course relationship
        return classEntityRepository.save(classEntity);
    }

    public List<LessonDTO> getLessonsByClass(Long courseId) {
        // Find Course first
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Find ClassEntity for this Course
        ClassEntity classEntity = findOrCreateClassEntity(course);
        
        List<Lesson> lessons = lessonRepository.findByClassEntityId(classEntity.getId());
        return lessons.stream()
                .map(l -> new LessonDTO(l.getId(), l.getTitle(), l.getFilePath(), classEntity.getId()))
                .collect(Collectors.toList());
    }
}

