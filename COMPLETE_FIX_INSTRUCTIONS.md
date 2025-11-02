# Complete Fix Instructions - Student Assignments

## Overview
Fix the error: `The method getAssignmentsByCourseId(Long) is undefined for the type AssignmentService`

## Complete Solution

### Step 1: Update StudentController.java

**Replace your entire StudentController.java with:**
- See: `COMPLETE_STUDENT_CONTROLLER_FIXED.java`

**Key changes:**
1. ✅ Added `@Autowired private AssignmentService assignmentService;`
2. ✅ Added `getMyAssignments()` method
3. ✅ Uses `getAssignmentsByClass()` instead of `getAssignmentsByCourseId()`
4. ✅ Endpoint: `GET /student/assignments`

### Step 2: Add Method to AssignmentService.java

**Add this method to your AssignmentService:**
- See: `COMPLETE_ASSIGNMENT_SERVICE_ADD_METHOD.java`

**Key method:**
```java
public SubmissionDTO getSubmissionByStudentAndAssignment(Long studentId, Long assignmentId) {
    Optional<Submission> submissionOpt = submissionRepository.findByStudentIdAndAssignmentId(
            studentId, assignmentId);

    if (submissionOpt.isEmpty()) {
        return null;
    }

    Submission submission = submissionOpt.get();
    SubmissionDTO dto = new SubmissionDTO();
    // ... set all fields ...
    return dto;
}
```

### Step 3: Add Method to SubmissionRepository.java

**Add this method to your SubmissionRepository:**
```java
Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
```

### Step 4: Remove Duplicate from AssignmentController.java

**If you added `getMyAssignments` to AssignmentController, REMOVE it:**
- The method should only be in StudentController

## Complete Files

### 1. StudentController.java
**Copy from:** `COMPLETE_STUDENT_CONTROLLER_FIXED.java`
- Complete controller with both `/classes` and `/assignments` endpoints

### 2. AssignmentService.java
**Add method from:** `COMPLETE_ASSIGNMENT_SERVICE_ADD_METHOD.java`
- Add `getSubmissionByStudentAndAssignment()` method

### 3. SubmissionRepository.java
**Add method:**
```java
Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
```

## Testing

After implementing, test with:
```bash
GET http://localhost:8082/student/assignments
Authorization: Bearer <studentToken>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Assignment 1",
    "description": "Complete the assignment",
    "dueDate": "2025-01-20T23:59:59",
    "maxGrade": 100,
    "courseId": 5,
    "className": "Data Structures",
    "status": "pending",
    "submissionId": null,
    "submittedAt": null,
    "grade": null,
    "feedback": null
  },
  {
    "id": 2,
    "title": "Assignment 2",
    "description": "Submit your work",
    "dueDate": "2025-01-18T23:59:59",
    "maxGrade": 100,
    "courseId": 5,
    "className": "Data Structures",
    "status": "submitted",
    "submissionId": 10,
    "submittedAt": "2025-01-17T10:30:00",
    "grade": null,
    "feedback": null
  }
]
```

## Checklist

- [ ] Replace StudentController.java with complete fixed version
- [ ] Add `getSubmissionByStudentAndAssignment()` to AssignmentService
- [ ] Add `findByStudentIdAndAssignmentId()` to SubmissionRepository
- [ ] Remove duplicate `getMyAssignments` from AssignmentController (if exists)
- [ ] Test endpoint: `GET /student/assignments`

## Summary

**What was fixed:**
1. ✅ Changed `getAssignmentsByCourseId()` → `getAssignmentsByClass()`
2. ✅ Moved `getMyAssignments` to StudentController (correct location)
3. ✅ Added `AssignmentService` to StudentController `@Autowired`
4. ✅ Added `getSubmissionByStudentAndAssignment()` to AssignmentService
5. ✅ Added `findByStudentIdAndAssignmentId()` to SubmissionRepository

After these changes, the error should be completely resolved!

