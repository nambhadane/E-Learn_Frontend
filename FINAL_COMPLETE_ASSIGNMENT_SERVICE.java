package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.Assignment;
import com.elearnhub.teacher_service.entity.Submission;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.repository.AssignmentRepository;
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

    // ✅ FIXED: saveSubmission - Submission entity uses relationship objects
    public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
        // Get Assignment entity
        Assignment assignment = assignmentRepository.findById(submissionDTO.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + submissionDTO.getAssignmentId()));
        
        // Get User entity (student)
        User student = userService.getUserById(submissionDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + submissionDTO.getStudentId()));

        Submission submission = new Submission();
        // ✅ FIXED: Submission entity uses relationship objects
        submission.setAssignment(assignment);  // ✅ Set Assignment object
        submission.setStudent(student);         // ✅ Set User object
        submission.setContent(submissionDTO.getContent());
        submission.setFilePath(submissionDTO.getFilePath());
        submission.setSubmittedAt(LocalDateTime.now());
        // Grade and feedback are null initially (teacher will grade later)

        Submission savedSubmission = submissionRepository.save(submission);
        return convertSubmissionToDTO(savedSubmission);
    }

    public List<SubmissionDTO> getSubmissionsByAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(this::convertSubmissionToDTO)
                .collect(Collectors.toList());
    }

    // ✅ FIXED: gradeSubmission - Set grade/feedback directly on Submission entity
    public SubmissionDTO gradeSubmission(Long submissionId, Double score, String feedback) {
        // Get submission
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        // ✅ FIXED: Set grade and feedback directly on Submission entity
        submission.setGrade(score);
        submission.setFeedback(feedback);
        
        // Save updated submission
        submissionRepository.save(submission);

        // Return updated submission DTO with grade
        return convertSubmissionToDTO(submission);
    }

    // ✅ FIXED: Convert Submission to SubmissionDTO - matches your actual entity structure
    private SubmissionDTO convertSubmissionToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        
        // ✅ FIXED: Get IDs from relationship objects
        if (submission.getAssignment() != null) {
            dto.setAssignmentId(submission.getAssignment().getId());
        }
        
        if (submission.getStudent() != null) {
            dto.setStudentId(submission.getStudent().getId());
            
            // Get student name from User object
            String studentName = submission.getStudent().getName() != null && 
                    !submission.getStudent().getName().trim().isEmpty()
                    ? submission.getStudent().getName()
                    : submission.getStudent().getUsername();
            dto.setStudentName(studentName);
        }
        
        dto.setContent(submission.getContent());
        dto.setFilePath(submission.getFilePath());
        dto.setSubmittedAt(submission.getSubmittedAt());
        
        // ✅ FIXED: Grade and feedback exist directly in Submission entity
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());

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
        // ✅ FIXED: Repository method is findByAssignmentIdAndStudentId (order matters!)
        Optional<Submission> submissionOpt = submissionRepository.findByAssignmentIdAndStudentId(
                assignmentId, studentId);

        if (submissionOpt.isEmpty()) {
            return null; // No submission found
        }

        Submission submission = submissionOpt.get();
        
        // ✅ Use the existing convertSubmissionToDTO method (already fixed above)
        return convertSubmissionToDTO(submission);
    }
}

