package com.elearnhub.teacher_service.dto;

// ✅ LessonDTO - Used for transferring Lesson data to/from frontend
public class LessonDTO {
    private Long id;
    private String title;
    private String filePath;
    private Long classId; // This is actually Course ID (named classId for frontend compatibility)

    // Constructors
    public LessonDTO() {
    }

    public LessonDTO(Long id, String title, String filePath, Long classId) {
        this.id = id;
        this.title = title;
        this.filePath = filePath;
        this.classId = classId;
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

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }
}

