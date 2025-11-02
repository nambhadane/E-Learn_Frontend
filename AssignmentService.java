package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.AssignmentDTO;
import com.elearnhub.teacher_service.dto.SubmissionDTO;
import com.elearnhub.teacher_service.entity.Assignment;
import com.elearnhub.teacher_service.repository.AssignmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

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

    public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
        // TODO: Implement submission saving logic
        // This will depend on your Submission entity structure
        throw new UnsupportedOperationException("Submission feature not yet implemented");
    }

    public SubmissionDTO gradeSubmission(Long submissionId, Double grade, String feedback) {
        // TODO: Implement grading logic
        // This will depend on your Submission entity structure
        throw new UnsupportedOperationException("Grading feature not yet implemented");
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
}

