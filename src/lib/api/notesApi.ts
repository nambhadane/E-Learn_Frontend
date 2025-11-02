import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface Lesson {
  id: number;
  title: string;
  filePath: string;
  classId?: number;
  classEntity?: {
    id: number;
    name: string;
  };
}

export interface UploadLessonRequest {
  classId: number;
  title: string;
  content?: string;
  file: File;
}

export interface LessonDTO {
  id: number;
  title: string;
  filePath: string;
  classId?: number;
}

export const notesApi = {
  // Upload a lesson/note with file
  uploadLesson: async (data: UploadLessonRequest) => {
    const formData = new FormData();
    formData.append('classId', data.classId.toString());
    formData.append('title', data.title);
    // Backend requires 'content' parameter even if not used
    // Send empty string or title if content not provided
    formData.append('content', data.content || data.title || '');
    formData.append('file', data.file);

    return apiClient.uploadFile<LessonDTO>(API_ENDPOINTS.LESSONS, formData);
  },

  // Get all lessons/notes for a specific class (for teachers)
  getLessonsByClass: async (classId: number) => {
    return apiClient.get<LessonDTO[]>(`${API_ENDPOINTS.LESSONS}/class/${classId}`);
  },

  // Get all lessons/notes for a specific class (for students - validates enrollment)
  getLessonsByClassForStudent: async (classId: number) => {
    return apiClient.get<LessonDTO[]>(`${API_ENDPOINTS.LESSONS}/student/class/${classId}`);
  },

  // Download a lesson file
  downloadLesson: async (lessonId: number, filename?: string) => {
    return apiClient.downloadFile(`${API_ENDPOINTS.LESSONS}/${lessonId}/download`, filename);
  },

  // View a lesson file (opens in browser)
  viewLesson: async (lessonId: number) => {
    const token = localStorage.getItem('authToken');
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}${API_ENDPOINTS.LESSONS}/${lessonId}/view`;
    
    // Open in new tab with authorization header won't work directly
    // Instead, create a temporary link with token in query (less secure but works)
    // OR better: create an iframe or window with fetch
    // For now, we'll use downloadFile but open in new window
    return apiClient.downloadFile(`${API_ENDPOINTS.LESSONS}/${lessonId}/view`);
  },
};

