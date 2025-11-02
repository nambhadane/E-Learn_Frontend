import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name?: string;
  email?: string;
  username: string;
  password: string;
}

export interface Teacher {
  id?: number;
  name?: string;
  email?: string;
  username: string;
  profilePicture?: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message?: string;
  token?: string;
}

export const teacherApi = {
  // Login - matches backend: POST /auth/login with { username, password }
  login: async (credentials: LoginRequest) => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, credentials);
  },

  // Register teacher (update endpoint when you share the register endpoint)
  register: async (data: RegisterRequest) => {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH_REGISTER, data);
  },

  // Get teacher profile (if available)
  getProfile: async () => {
    return apiClient.get<Teacher>(API_ENDPOINTS.TEACHER_PROFILE);
  },

  // Update teacher profile
  updateProfile: async (data: { name?: string; email?: string }) => {
    return apiClient.put<Teacher>(API_ENDPOINTS.TEACHER_PROFILE, data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.uploadFile<Teacher>(`${API_ENDPOINTS.TEACHER_PROFILE}/picture`, formData);
  },

  // Get teacher dashboard data (if available)
  getDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.TEACHER_DASHBOARD);
  },
};

