package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.Assignment;
import com.elearnhub.teacher_service.entity.Grade;
import com.elearnhub.teacher_service.entity.Submission;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.repository.AssignmentRepository;
import com.elearnhub.teacher_service.repository.GradeRepository;
import com.elearnhub.teacher_service.repository.SubmissionRepository;
import com.elearnhub.teacher_service.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserService userService;

    public AssignmentDTO createAssignment(AssignmentDTO assignmentDTO) {
        Assignment assignment = new Assignment();
        assignment.setTitle(assignmentDTO.getTitle());
        assignment.setDescription(assignmentDTO.getDescription());
        assignment.setDueDate(assignmentDTO.getDueDate());
        assignment.setMaxGrade(assignmentDTO.getMaxGrade());
        assignment.setCourseId(assignmentDTO.getCourseId());

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return convertToDTO(savedAssignment);
    }

    public List<AssignmentDTO> getAssignmentsByClass(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AssignmentDTO getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
        return convertToDTO(assignment);
    }

    public void deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Assignment not found with id: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
        Submission submission = new Submission();
        submission.setAssignmentId(submissionDTO.getAssignmentId());
        submission.setStudentId(submissionDTO.getStudentId());
        submission.setContent(submissionDTO.getContent());
        submission.setFilePath(submissionDTO.getFilePath());
        submission.setSubmittedAt(LocalDateTime.now());

        Submission savedSubmission = submissionRepository.save(submission);
        return convertSubmissionToDTO(savedSubmission);
    }

    public List<SubmissionDTO> getSubmissionsByAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(this::convertSubmissionToDTO)
                .collect(Collectors.toList());
    }

    public SubmissionDTO gradeSubmission(Long submissionId, Double score, String feedback) {
        // Get submission
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        // Check if grade already exists
        Optional<Grade> existingGradeOpt = gradeRepository.findBySubmissionId(submissionId);
        Grade grade;

        if (existingGradeOpt.isPresent()) {
            // Update existing grade
            grade = existingGradeOpt.get();
            grade.setScore(score);
            grade.setFeedback(feedback);
        } else {
            // Create new grade
            grade = new Grade();
            grade.setSubmissionId(submissionId);
            grade.setScore(score);
            grade.setFeedback(feedback);
        }

        gradeRepository.save(grade);

        // Return updated submission DTO with grade
        SubmissionDTO submissionDTO = convertSubmissionToDTO(submission);
        submissionDTO.setGrade(grade.getScore());
        submissionDTO.setFeedback(grade.getFeedback());

        return submissionDTO;
    }

    private SubmissionDTO convertSubmissionToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setAssignmentId(submission.getAssignmentId());
        dto.setStudentId(submission.getStudentId());
        dto.setContent(submission.getContent());
        dto.setFilePath(submission.getFilePath());
        dto.setSubmittedAt(submission.getSubmittedAt());

        // Get student name
        try {
            Optional<User> studentOpt = userService.getUserById(submission.getStudentId());
            if (studentOpt.isPresent()) {
                User student = studentOpt.get();
                dto.setStudentName(student.getName() != null ? student.getName() : student.getUsername());
            }
        } catch (Exception e) {
            // If we can't get student name, just use ID
            dto.setStudentName("Student #" + submission.getStudentId());
        }

        // Get grade if exists
        Optional<Grade> gradeOpt = gradeRepository.findBySubmissionId(submission.getId());
        if (gradeOpt.isPresent()) {
            Grade grade = gradeOpt.get();
            dto.setGrade(grade.getScore());
            dto.setFeedback(grade.getFeedback());
        }

        return dto;
    }

    private AssignmentDTO convertToDTO(Assignment assignment) {
        AssignmentDTO dto = new AssignmentDTO();
        dto.setId(assignment.getId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setDueDate(assignment.getDueDate());
        dto.setMaxGrade(assignment.getMaxGrade());
        dto.setCourseId(assignment.getCourseId());
        return dto;
    }
}

