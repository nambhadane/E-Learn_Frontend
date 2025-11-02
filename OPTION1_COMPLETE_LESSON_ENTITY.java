package com.elearnhub.teacher_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Title cannot be null")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @NotNull(message = "File path cannot be null")
    private String filePath; // Store the file location (e.g., local path or S3 URL)

    // ✅ CHANGED: Use Course instead of ClassEntity
    @NotNull(message = "Course cannot be null")
    @ManyToOne
    @JoinColumn(name = "course_id") // Changed from class_id
    private Course course; // Changed from ClassEntity classEntity

    // Constructors
    public Lesson() {
    }

    public Lesson(String title, String filePath, Course course) {
        this.title = title;
        this.filePath = filePath;
        this.course = course;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }
}

