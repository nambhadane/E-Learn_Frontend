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
  role?: string; // Add role field
}

export interface Student {
  id?: number;
  name?: string;
  email?: string;
  username: string;
  profilePicture?: string;
  rollNumber?: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message?: string;
  token?: string;
}

export const studentApi = {
  // Login - matches backend: POST /auth/login with { username, password }
  login: async (credentials: LoginRequest) => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, credentials);
  },

  // Register student
  register: async (data: RegisterRequest) => {
    // Always set role to STUDENT for student registration
    const registerData = {
      ...data,
      role: 'STUDENT'
    };
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH_REGISTER, registerData);
  },

  // Get student profile (if available)
  getProfile: async () => {
    return apiClient.get<Student>(API_ENDPOINTS.STUDENT_PROFILE);
  },

  // Update student profile
  updateProfile: async (data: { name?: string; email?: string }) => {
    return apiClient.put<Student>(API_ENDPOINTS.STUDENT_PROFILE, data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.uploadFile<Student>(`${API_ENDPOINTS.STUDENT_PROFILE}/picture`, formData);
  },
};

