import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface Class {
  id?: number;
  name: string;
  subject: string;
  description: string;
  students?: number;
  teacherId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassRequest {
  name: string;
  subject: string;
  description: string;
}

export interface CreateClassResponse {
  message?: string;
  course?: Class;
}

export const classApi = {
  // Get all classes for the authenticated teacher
  getClasses: async () => {
    return apiClient.get<Class[]>(API_ENDPOINTS.TEACHER_CLASSES);
  },

  // Create a new class
  createClass: async (data: CreateClassRequest) => {
    return apiClient.post<CreateClassResponse>(API_ENDPOINTS.TEACHER_CLASSES, data);
  },

  // Get a single class by ID
  getClassById: async (id: number) => {
    return apiClient.get<Class>(`${API_ENDPOINTS.TEACHER_CLASSES}/${id}`);
  },

  // Update a class
  updateClass: async (id: number, data: Partial<CreateClassRequest>) => {
    return apiClient.put<Class>(`${API_ENDPOINTS.TEACHER_CLASSES}/${id}`, data);
  },

  // Delete a class
  deleteClass: async (id: number) => {
    return apiClient.delete(`${API_ENDPOINTS.TEACHER_CLASSES}/${id}`);
  },
};

