import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface StudentClass {
  id?: number;
  name: string;
  subject?: string;
  description?: string;
  teacher?: string;
  teacherId?: number;
  teacherName?: string;
  schedule?: string; // If available from backend
  enrolledAt?: string;
  students?: number;
}

export const studentClassApi = {
  // Get all classes for the authenticated student
  getMyClasses: async () => {
    return apiClient.get<StudentClass[]>(API_ENDPOINTS.STUDENT_CLASSES);
  },

  // Get a single class by ID
  getClassById: async (id: number) => {
    return apiClient.get<StudentClass>(`${API_ENDPOINTS.STUDENT_CLASSES}/${id}`);
  },
};

