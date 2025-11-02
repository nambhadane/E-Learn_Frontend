import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface AssignmentDTO {
  id?: number;
  title: string;
  description: string;
  dueDate: string; // ISO date string from backend
  maxGrade: number;
  courseId: number; // Course ID (named courseId to match backend)
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  dueDate: string; // ISO date string
  maxGrade: number;
  courseId: number;
}

export interface SubmissionDTO {
  id?: number;
  assignmentId: number;
  studentId: number;
  studentName?: string;
  content?: string;
  filePath?: string;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}

export interface StudentAssignment extends AssignmentDTO {
  className?: string;
  status?: 'pending' | 'submitted' | 'graded';
  submissionId?: number;
  submittedAt?: string;
  grade?: number | null;
  feedback?: string | null;
}

export interface SubmitAssignmentRequest {
  assignmentId: number;
  content?: string;
  filePath?: string;
}

export const assignmentApi = {
  // Create a new assignment
  createAssignment: async (data: CreateAssignmentRequest) => {
    return apiClient.post<AssignmentDTO>(API_ENDPOINTS.ASSIGNMENTS, data);
  },

  // Get all assignments for a specific class/course
  getAssignmentsByClass: async (classId: number) => {
    return apiClient.get<AssignmentDTO[]>(`${API_ENDPOINTS.ASSIGNMENTS}/class/${classId}`);
  },

  // Get a single assignment by ID
  getAssignmentById: async (id: number) => {
    return apiClient.get<AssignmentDTO>(`${API_ENDPOINTS.ASSIGNMENTS}/${id}`);
  },

  // Delete an assignment
  deleteAssignment: async (id: number) => {
    return apiClient.delete(`${API_ENDPOINTS.ASSIGNMENTS}/${id}`);
  },

  // Get submissions by assignment ID
  getSubmissionsByAssignment: async (assignmentId: number) => {
    return apiClient.get<SubmissionDTO[]>(`${API_ENDPOINTS.ASSIGNMENTS}/${assignmentId}/submissions`);
  },

  // Grade a submission
  gradeSubmission: async (submissionId: number, data: GradeSubmissionRequest) => {
    return apiClient.put<SubmissionDTO>(`${API_ENDPOINTS.ASSIGNMENTS}/submissions/${submissionId}/grade`, data);
  },

  // ✅ NEW: Get assignments for authenticated student (from enrolled classes)
  getStudentAssignments: async () => {
    return apiClient.get<StudentAssignment[]>(API_ENDPOINTS.STUDENT_ASSIGNMENTS);
  },

  // ✅ NEW: Submit assignment (for students) - supports file uploads
  submitAssignment: async (assignmentId: number, content?: string, files?: File[]) => {
    // If files are provided, use multipart/form-data
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId.toString());
      if (content) {
        formData.append('content', content);
      }
      
      // Append all files
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      return apiClient.uploadFile<SubmissionDTO>(`${API_ENDPOINTS.ASSIGNMENTS}/submissions`, formData);
    } else {
      // No files, use JSON request
      const data: SubmitAssignmentRequest = {
        assignmentId,
        content: content || undefined,
      };
      return apiClient.post<SubmissionDTO>(`${API_ENDPOINTS.ASSIGNMENTS}/submissions`, data);
    }
  },
};

