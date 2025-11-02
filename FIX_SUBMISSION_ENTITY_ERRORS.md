# Fix: Submission Entity Type Errors

## Problem

Your `Submission` entity uses **Long IDs** (not relationship objects):
- `Long assignmentId` (not `Assignment assignment`)
- `Long studentId` (not `User student`)
- No `grade` or `feedback` fields directly (they're in separate `Grade` entity)

But your code is trying to access relationship objects that don't exist.

## Errors

1. `submission.getAssignment().getId()` - ❌ No `getAssignment()` method
2. `submission.getStudent().getId()` - ❌ No `getStudent()` method  
3. `submission.getGrade()` - ❌ No `grade` field in Submission
4. `submission.getFeedback()` - ❌ No `feedback` field in Submission

## Solution

### Fixed convertSubmissionToDTO Method

```java
// ✅ FIXED: Match your actual Submission entity structure
private SubmissionDTO convertSubmissionToDTO(Submission submission) {
    SubmissionDTO dto = new SubmissionDTO();
    dto.setId(submission.getId());
    
    // ✅ FIXED: Use Long IDs directly (not relationship objects)
    dto.setAssignmentId(submission.getAssignmentId());  // ✅ Long, not Assignment
    dto.setStudentId(submission.getStudentId());        // ✅ Long, not User
    
    dto.setContent(submission.getContent());
    dto.setFilePath(submission.getFilePath());
    dto.setSubmittedAt(submission.getSubmittedAt());

    // ✅ FIXED: Get student name from UserService (since Submission has studentId, not User)
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
        dto.setGrade(grade.getScore());      // ✅ From Grade entity
        dto.setFeedback(grade.getFeedback()); // ✅ From Grade entity
    }

    return dto;
}
```

### Fixed getSubmissionByStudentAndAssignment Method

```java
// ✅ FIXED: Use convertSubmissionToDTO (already fixed above)
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

### Fixed saveSubmission Method

```java
// ✅ FIXED: Use Long IDs directly
public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
    Submission submission = new Submission();
    submission.setAssignmentId(submissionDTO.getAssignmentId()); // ✅ Long ID
    submission.setStudentId(submissionDTO.getStudentId());       // ✅ Long ID
    submission.setContent(submissionDTO.getContent());
    submission.setFilePath(submissionDTO.getFilePath());
    submission.setSubmittedAt(LocalDateTime.now());

    Submission savedSubmission = submissionRepository.save(submission);
    return convertSubmissionToDTO(savedSubmission);
}
```

## Complete Fixed AssignmentService

**See:** `COMPLETE_FIXED_ASSIGNMENT_SERVICE.java`

**Key changes:**
1. ✅ Use `submission.getAssignmentId()` instead of `submission.getAssignment().getId()`
2. ✅ Use `submission.getStudentId()` instead of `submission.getStudent().getId()`
3. ✅ Get grade/feedback from `Grade` entity via `gradeRepository`
4. ✅ Get student name from `UserService.getUserById(submission.getStudentId())`

## Your Submission Entity Structure

```java
@Entity
public class Submission {
    private Long id;
    private Long assignmentId;      // ✅ Long ID, not Assignment object
    private Long studentId;          // ✅ Long ID, not User object
    private String content;
    private String filePath;
    private LocalDateTime submittedAt;
    // ❌ NO grade or feedback fields (they're in Grade entity)
}
```

## Summary

**Replace your `AssignmentService.java` with:** `COMPLETE_FIXED_ASSIGNMENT_SERVICE.java`

All errors will be fixed! ✅

