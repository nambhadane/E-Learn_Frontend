// ===================================================================================
// FIXED: AssignmentService getSubmissionByStudentAndAssignment Method
// Fix: submittedAt type mismatch error
// ===================================================================================

// ===================================================================================
// Updated Method for AssignmentService.java
// ===================================================================================

    // ✅ FIXED: Get submission by student and assignment
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
        
        // ✅ FIXED: If SubmissionDTO.submittedAt is LocalDateTime, pass LocalDateTime directly
        dto.setSubmittedAt(submission.getSubmittedAt()); // Pass LocalDateTime directly
        
        // ✅ ALTERNATIVE: If SubmissionDTO.submittedAt is String, convert to String
        // dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        //         submission.getSubmittedAt().toString() : null);
        
        // ✅ ALTERNATIVE: If SubmissionDTO.submittedAt is String and needs ISO format
        // dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        //         submission.getSubmittedAt().toString() : null);
        
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());

        return dto;
    }

// ===================================================================================
// Check Your SubmissionDTO
// ===================================================================================

// Your SubmissionDTO should have one of these:

// Option 1: LocalDateTime (recommended - matches entity)
/*
public class SubmissionDTO {
    private LocalDateTime submittedAt;  // ✅ Use this
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
*/

// Option 2: String (if you want to convert)
/*
public class SubmissionDTO {
    private String submittedAt;  // ✅ Use this
    
    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }
}
*/

// ===================================================================================
// Solution Based on Your SubmissionDTO Type
// ===================================================================================

// If SubmissionDTO.submittedAt is LocalDateTime:
// ✅ Use: dto.setSubmittedAt(submission.getSubmittedAt());

// If SubmissionDTO.submittedAt is String:
// ✅ Use: dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
//         submission.getSubmittedAt().toString() : null);

// ===================================================================================
// Complete Fixed Method (assuming LocalDateTime)
// ===================================================================================

    // ✅ FIXED: Get submission by student and assignment
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
        dto.setSubmittedAt(submission.getSubmittedAt());
        
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());

        return dto;
    }

