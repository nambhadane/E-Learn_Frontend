# Fix: submittedAt Type Error

## Problem
Error: `The method setSubmittedAt(LocalDateTime) in the type SubmissionDTO is not applicable for the arguments (String)`

## Root Cause
`SubmissionDTO.setSubmittedAt()` expects a `LocalDateTime`, but you're passing a `String` from `toString()`.

## Solution

### Option 1: Pass LocalDateTime Directly (Recommended)

If your `SubmissionDTO` has `submittedAt` as `LocalDateTime`:

```java
// ✅ FIXED: Pass LocalDateTime directly
dto.setSubmittedAt(submission.getSubmittedAt());

// ❌ WRONG: Don't convert to String
// dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
//         submission.getSubmittedAt().toString() : null);
```

### Option 2: Change SubmissionDTO to Use String

If you want to keep it as String in DTO:

**Update SubmissionDTO.java:**
```java
public class SubmissionDTO {
    private String submittedAt;  // ✅ Changed from LocalDateTime to String
    
    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public String getSubmittedAt() {
        return submittedAt;
    }
}
```

**Then in AssignmentService:**
```java
// ✅ Convert to String
dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        submission.getSubmittedAt().toString() : null);
```

### Option 3: Use DateTimeFormatter (If String Required)

If DTO needs String in specific format:

```java
import java.time.format.DateTimeFormatter;

private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

// In method:
dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        submission.getSubmittedAt().format(formatter) : null);
```

## Recommended Fix

**Most likely your SubmissionDTO has `submittedAt` as `LocalDateTime`:**

```java
public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
    Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
            studentId, assignmentId);

    if (submissionOpt.isEmpty()) {
        return null;
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
```

## Check Your SubmissionDTO

Look at your `SubmissionDTO.java` file:

```java
public class SubmissionDTO {
    // Check this field type:
    private LocalDateTime submittedAt;  // ✅ This means use LocalDateTime
    // OR
    private String submittedAt;  // ✅ This means use String
}
```

## Quick Fix

**Just change this line:**
```java
// ❌ OLD (causing error):
dto.setSubmittedAt(submission.getSubmittedAt() != null ? 
        submission.getSubmittedAt().toString() : null);

// ✅ NEW (fixed):
dto.setSubmittedAt(submission.getSubmittedAt());
```

Spring Boot will automatically serialize `LocalDateTime` to JSON string when returning the response.

