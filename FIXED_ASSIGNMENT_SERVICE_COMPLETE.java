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
        // Get Assignment and User entities
        Assignment assignment = assignmentRepository.findById(submissionDTO.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + submissionDTO.getAssignmentId()));
        
        User student = userService.getUserById(submissionDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + submissionDTO.getStudentId()));

        Submission submission = new Submission();
        // ✅ FIXED: If Submission entity uses relationship objects, set them directly
        submission.setAssignment(assignment);  // If Submission has @ManyToOne Assignment assignment
        submission.setStudent(student);         // If Submission has @ManyToOne User student
        
        // ✅ ALTERNATIVE: If Submission entity uses Long IDs instead:
        // submission.setAssignmentId(submissionDTO.getAssignmentId());
        // submission.setStudentId(submissionDTO.getStudentId());
        
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

    // ✅ FIXED: Convert Submission to SubmissionDTO
    private SubmissionDTO convertSubmissionToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        
        // ✅ FIXED: Get ID from relationship objects
        if (submission.getAssignment() != null) {
            dto.setAssignmentId(submission.getAssignment().getId());
        } else if (submission.getAssignmentId() != null) {
            // ✅ ALTERNATIVE: If Submission has assignmentId field directly
            dto.setAssignmentId(submission.getAssignmentId());
        }
        
        // ✅ FIXED: Get ID from relationship objects
        if (submission.getStudent() != null) {
            Long studentId = submission.getStudent().getId();
            dto.setStudentId(studentId);
            
            // Get student name from User object
            String studentName = submission.getStudent().getName() != null && 
                    !submission.getStudent().getName().trim().isEmpty()
                    ? submission.getStudent().getName()
                    : submission.getStudent().getUsername();
            dto.setStudentName(studentName);
        } else if (submission.getStudentId() != null) {
            // ✅ ALTERNATIVE: If Submission has studentId field directly
            dto.setStudentId(submission.getStudentId());
            
            // Get student name from UserService
            try {
                Optional<User> studentOpt = userService.getUserById(submission.getStudentId());
                if (studentOpt.isPresent()) {
                    User student = studentOpt.get();
                    dto.setStudentName(student.getName() != null && 
                            !student.getName().trim().isEmpty()
                            ? student.getName()
                            : student.getUsername());
                }
            } catch (Exception e) {
                dto.setStudentName("Student #" + submission.getStudentId());
            }
        }
        
        dto.setContent(submission.getContent());
        dto.setFilePath(submission.getFilePath());
        dto.setSubmittedAt(submission.getSubmittedAt());

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
    
    // ✅ FIXED: Get submission by student and assignment
    public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
        Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
                studentId, assignmentId);

        if (submissionOpt.isEmpty()) {
            return null; // No submission found
        }

        Submission submission = submissionOpt.get();
        
        // ✅ Use the existing convertSubmissionToDTO method (already fixed above)
        return convertSubmissionToDTO(submission);
    }
}

