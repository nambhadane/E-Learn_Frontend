# Complete Fix Guide - AssignmentService Errors

## Your Actual Entity Structure

### Submission Entity
```java
@Entity
public class Submission {
    private Long id;
    
    @ManyToOne
    private Assignment assignment;  // ✅ Relationship object (not Long ID)
    
    @ManyToOne
    private User student;            // ✅ Relationship object (not Long ID)
    
    private String content;
    private String filePath;
    private LocalDateTime submittedAt;
    private Double grade;            // ✅ Direct field in Submission
    private String feedback;         // ✅ Direct field in Submission
}
```

### SubmissionRepository
```java
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    // ✅ Note: Method order is findByAssignmentIdAndStudentId (not findByStudentIdAndAssignmentId)
}
```

## Complete Fixed AssignmentService

**Replace your entire AssignmentService.java with:**
- See: `COMPLETE_CORRECTED_ASSIGNMENT_SERVICE.java`

## Key Fixes

### Fix 1: saveSubmission Method
```java
// ✅ FIXED: Set relationship objects (not IDs)
public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
    // Get entities first
    Assignment assignment = assignmentRepository.findById(submissionDTO.getAssignmentId())
            .orElseThrow(...);
    User student = userService.getUserById(submissionDTO.getStudentId())
            .orElseThrow(...);

    Submission submission = new Submission();
    submission.setAssignment(assignment);  // ✅ Set object
    submission.setStudent(student);       // ✅ Set object
    submission.setContent(submissionDTO.getContent());
    submission.setFilePath(submissionDTO.getFilePath());
    submission.setSubmittedAt(LocalDateTime.now());
    
    return convertSubmissionToDTO(submissionRepository.save(submission));
}
```

### Fix 2: convertSubmissionToDTO Method
```java
// ✅ FIXED: Get IDs from relationship objects
private SubmissionDTO convertSubmissionToDTO(Submission submission) {
    SubmissionDTO dto = new SubmissionDTO();
    dto.setId(submission.getId());
    
    // ✅ Get IDs from relationship objects
    if (submission.getAssignment() != null) {
        dto.setAssignmentId(submission.getAssignment().getId());
    }
    
    if (submission.getStudent() != null) {
        dto.setStudentId(submission.getStudent().getId());
        // Get student name...
    }
    
    dto.setContent(submission.getContent());
    dto.setFilePath(submission.getFilePath());
    dto.setSubmittedAt(submission.getSubmittedAt());
    
    // ✅ Get grade/feedback directly from Submission entity
    dto.setGrade(submission.getGrade());
    dto.setFeedback(submission.getFeedback());
    
    return dto;
}
```

### Fix 3: gradeSubmission Method
```java
// ✅ FIXED: Set grade/feedback directly on Submission (not separate Grade entity)
public SubmissionDTO gradeSubmission(Long submissionId, Double score, String feedback) {
    Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(...);
    
    // ✅ Set directly on Submission entity
    submission.setGrade(score);
    submission.setFeedback(feedback);
    
    submissionRepository.save(submission);
    return convertSubmissionToDTO(submission);
}
```

### Fix 4: getSubmissionByStudentAndAssignment Method
```java
// ✅ FIXED: Use correct repository method name and parameter order
public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
    // ✅ Repository method is findByAssignmentIdAndStudentId (not findByStudentIdAndAssignmentId)
    // ✅ Parameter order: assignmentId first, then studentId
    Optional<Submission> submissionOpt = submissionRepository.findByAssignmentIdAndStudentId(
            assignmentId, studentId);

    if (submissionOpt.isEmpty()) {
        return null;
    }

    return convertSubmissionToDTO(submissionOpt.get());
}
```

## Summary of All Fixes

| Issue | Wrong Code | Fixed Code |
|-------|------------|------------|
| saveSubmission | `submission.setAssignmentId()` | `submission.setAssignment(assignment)` |
| saveSubmission | `submission.setStudentId()` | `submission.setStudent(student)` |
| convertSubmissionToDTO | `dto.setAssignmentId(submission.getAssignmentId())` | `dto.setAssignmentId(submission.getAssignment().getId())` |
| convertSubmissionToDTO | `dto.setStudentId(submission.getStudentId())` | `dto.setStudentId(submission.getStudent().getId())` |
| convertSubmissionToDTO | Get grade from Grade entity | `dto.setGrade(submission.getGrade())` |
| gradeSubmission | Create/update Grade entity | `submission.setGrade(score)` |
| getSubmissionByStudentAndAssignment | `findByStudentIdAndAssignmentId()` | `findByAssignmentIdAndStudentId()` |
| Repository method order | `(studentId, assignmentId)` | `(assignmentId, studentId)` |

## Complete File

**Copy:** `COMPLETE_CORRECTED_ASSIGNMENT_SERVICE.java`

This has all fixes applied and matches your actual entity structure! ✅

