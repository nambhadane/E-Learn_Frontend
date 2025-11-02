# Quick Fix: AssignmentService Method Error

## Problem
Error: `The method getAssignmentsByCourseId(Long) is undefined for the type AssignmentService`

## Root Cause
Your `AssignmentService` has `getAssignmentsByClass(Long)` method, but the code is calling `getAssignmentsByCourseId(Long)`.

## Solution

### Fix 1: Change Method Call (In AssignmentController)

**In your AssignmentController.java**, find this line:
```java
// ❌ WRONG:
List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourseId(course.getId());

// ✅ FIXED:
List<AssignmentDTO> assignments = assignmentService.getAssignmentsByClass(course.getId());
```

### Fix 2: Fix Endpoint Path

**In your AssignmentController.java**, the endpoint path is wrong:

```java
// ❌ WRONG: This creates /assignments/assignments (duplicate)
@GetMapping("/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(...)

// ✅ FIXED Option 1: Move to StudentController (Recommended)
// In StudentController.java (which has @RequestMapping("/student")):
@GetMapping("/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(...)
// This creates: /student/assignments ✅

// ✅ FIXED Option 2: Fix path in AssignmentController
@GetMapping("/student/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getStudentAssignments(...)
// This creates: /assignments/student/assignments (works but not ideal)
```

## Recommended Solution

**Move the method to StudentController.java** (cleanest approach):

1. **Add AssignmentService to StudentController:**
```java
@Autowired
private AssignmentService assignmentService;
```

2. **Add the method to StudentController:**
```java
@GetMapping("/assignments")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> getMyAssignments(Authentication authentication) {
    // ... implementation ...
    // ✅ Use: assignmentService.getAssignmentsByClass(course.getId());
    // ❌ NOT: assignmentService.getAssignmentsByCourseId(course.getId());
}
```

3. **Remove the method from AssignmentController** (if you added it there)

## Required: Add Missing Method to AssignmentService

Make sure `AssignmentService` has `getSubmissionByStudentAndAssignment`:

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
    dto.setContent(submission.getContent());
    dto.setGrade(submission.getGrade());
    dto.setFeedback(submission.getFeedback());
    // ... set other fields ...

    return dto;
}
```

## Required: Add to SubmissionRepository

```java
Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
```

## Complete Fix Checklist

- [ ] Change `getAssignmentsByCourseId` → `getAssignmentsByClass` in AssignmentController
- [ ] Move `getMyAssignments` to StudentController OR fix path to `/student/assignments`
- [ ] Add `AssignmentService` to StudentController `@Autowired`
- [ ] Add `getSubmissionByStudentAndAssignment` to AssignmentService
- [ ] Add `findByStudentIdAndAssignmentId` to SubmissionRepository
- [ ] Remove duplicate method from AssignmentController (if you added it there)

## Testing

After fixing, test with:
```bash
GET http://localhost:8082/student/assignments
Authorization: Bearer <studentToken>
```

Should return list of assignments from enrolled classes with status and submission info.

