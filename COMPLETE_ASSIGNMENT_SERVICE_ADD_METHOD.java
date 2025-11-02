// ===================================================================================
// ADD THIS METHOD TO YOUR AssignmentService.java
// Location: src/main/java/com/elearnhub/teacher_service/service/AssignmentService.java
// ===================================================================================

package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.Assignment;
import com.elearnhub.teacher_service.entity.Submission;
import com.elearnhub.teacher_service.repository.AssignmentRepository;
import com.elearnhub.teacher_service.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    // ... your existing methods ...

    // ✅ NEW: Get submission by student and assignment
    // Add this method to your AssignmentService
    public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
        Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
                studentId, assignmentId);

        if (submissionOpt.isEmpty()) {
            return null; // No submission found
        }

        Submission submission = submissionOpt.get();
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setAssignmentId(submission.getAssignment().getId());
        dto.setStudentId(submission.getStudent().getId());
        
        // Set student name
        if (submission.getStudent() != null) {
            String studentName = submission.getStudent().getName() != null && 
                    !submission.getStudent().getName().trim().isEmpty()
                    ? submission.getStudent().getName()
                    : submission.getStudent().getUsername();
            dto.setStudentName(studentName);
        }
        
        dto.setContent(submission.getContent());
        dto.setFilePath(submission.getFilePath());
        
        // ✅ FIXED: Pass LocalDateTime directly (not String)
        // If SubmissionDTO.submittedAt is LocalDateTime, use this:
        dto.setSubmittedAt(submission.getSubmittedAt());
        
        // ✅ ALTERNATIVE: If SubmissionDTO.submittedAt is String, use this instead:
        // dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        //         submission.getSubmittedAt().toString() : null);
        
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());

        return dto;
    }

    // ... rest of your existing methods ...
}

// ===================================================================================
// REQUIRED: Add to SubmissionRepository.java
// Location: src/main/java/com/elearnhub/teacher_service/repository/SubmissionRepository.java
// ===================================================================================

package com.elearnhub.teacher_service.repository;

import com.elearnhub.teacher_service.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    // ... your existing methods ...
    
    // ✅ NEW: Find submission by student and assignment
    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
}

// ===================================================================================
// IMPORTANT: Make sure your Submission entity has these relationships:
// ===================================================================================

/*
@Entity
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;  // User with STUDENT role
    
    private String content;
    private String filePath;
    private LocalDateTime submittedAt;
    private Double grade;
    private String feedback;
    
    // ... getters and setters ...
}
*/

// ===================================================================================
// NOTES:
// ===================================================================================
// 1. Make sure SubmissionRepository is autowired in AssignmentService
// 2. Make sure Submission entity has assignment and student relationships
// 3. Make sure findByStudentIdAndAssignmentId method exists in SubmissionRepository
// ===================================================================================

