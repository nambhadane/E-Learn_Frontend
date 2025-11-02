# Quick Fix: Submission Entity Errors

## Errors Found

1. ❌ `submission.getAssignment().getId()` - Submission has `assignmentId` (Long), not `Assignment` object
2. ❌ `submission.getStudent().getId()` - Submission has `studentId` (Long), not `User` object  
3. ❌ `submission.getGrade()` - No `grade` field in Submission (it's in `Grade` entity)
4. ❌ `submission.getFeedback()` - No `feedback` field in Submission (it's in `Grade` entity)

## Your Submission Entity Structure

```java
public class Submission {
    private Long id;
    private Long assignmentId;      // ✅ Long ID (not Assignment object)
    private Long studentId;          // ✅ Long ID (not User object)
    private String content;
    private String filePath;
    private LocalDateTime submittedAt;
    // ❌ NO grade or feedback (they're in Grade entity)
}
```

## Fixes

### Fix 1: convertSubmissionToDTO Method

**In your AssignmentService.java, replace `convertSubmissionToDTO` method with:**

```java
private SubmissionDTO convertSubmissionToDTO(Submission submission) {
    SubmissionDTO dto = new SubmissionDTO();
    dto.setId(submission.getId());
    
    // ✅ FIXED: Use Long IDs directly
    dto.setAssignmentId(submission.getAssignmentId());  // ✅ submission.getAssignmentId() returns Long
    dto.setStudentId(submission.getStudentId());        // ✅ submission.getStudentId() returns Long
    
    dto.setContent(submission.getContent());
    dto.setFilePath(submission.getFilePath());
    dto.setSubmittedAt(submission.getSubmittedAt());

    // ✅ FIXED: Get student name from UserService
    try {
        Optional<User> studentOpt = userService.getUserById(submission.getStudentId());
        if (studentOpt.isPresent()) {
            User student = studentOpt.get();
            String studentName = student.getName() != null && 
                    !student.getName().trim().isEmpty()
                    ? student.getName()
                    : student.getUsername();
            dto.setStudentName(studentName);
        } else {
            dto.setStudentName("Student #" + submission.getStudentId());
        }
    } catch (Exception e) {
        dto.setStudentName("Student #" + submission.getStudentId());
    }

    // ✅ FIXED: Get grade from Grade entity (separate table)
    Optional<Grade> gradeOpt = gradeRepository.findBySubmissionId(submission.getId());
    if (gradeOpt.isPresent()) {
        Grade grade = gradeOpt.get();
        dto.setGrade(grade.getScore());
        dto.setFeedback(grade.getFeedback());
    }

    return dto;
}
```

### Fix 2: getSubmissionByStudentAndAssignment Method

**Already fixed - just use `convertSubmissionToDTO`:**

```java
public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
    Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
            studentId, assignmentId);

    if (submissionOpt.isEmpty()) {
        return null;
    }

    Submission submission = submissionOpt.get();
    
    // ✅ Use existing convertSubmissionToDTO method
    return convertSubmissionToDTO(submission);
}
```

## Complete Fixed AssignmentService

**Replace your entire AssignmentService.java with:**
- See: `COMPLETE_FIXED_ASSIGNMENT_SERVICE.java`

This has all fixes applied and matches your actual entity structure.

## Summary of Changes

| Wrong Code | Fixed Code |
|------------|------------|
| `submission.getAssignment().getId()` | `submission.getAssignmentId()` |
| `submission.getStudent().getId()` | `submission.getStudentId()` |
| `submission.getGrade()` | `gradeRepository.findBySubmissionId(id).get().getScore()` |
| `submission.getFeedback()` | `gradeRepository.findBySubmissionId(id).get().getFeedback()` |

After replacing with `COMPLETE_FIXED_ASSIGNMENT_SERVICE.java`, all errors will be resolved! ✅

