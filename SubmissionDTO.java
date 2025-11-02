package com.elearnhub.teacher_service.dto;

import java.time.LocalDateTime;

public class SubmissionDTO {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName; // For display purposes
    private String content;
    private String filePath;
    private LocalDateTime submittedAt;
    private Double grade; // Current grade if graded
    private String feedback; // Feedback if graded

    // Constructors
    public SubmissionDTO() {
    }

    public SubmissionDTO(Long id, Long assignmentId, Long studentId, String studentName, 
                       String content, String filePath, LocalDateTime submittedAt, 
                       Double grade, String feedback) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.content = content;
        this.filePath = filePath;
        this.submittedAt = submittedAt;
        this.grade = grade;
        this.feedback = feedback;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Double getGrade() {
        return grade;
    }

    public void setGrade(Double grade) {
        this.grade = grade;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}


