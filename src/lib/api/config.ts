// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  // Teacher endpoints
  TEACHER_PROFILE: '/teacher/profile',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CLASSES: '/courses', // Backend endpoint for courses
  LESSONS: '/lessons', // Backend endpoint for lessons/notes
  ASSIGNMENTS: '/assignments', // Backend endpoint for assignments
  // Student endpoints
  STUDENT_PROFILE: '/student/profile',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_CLASSES: '/student/classes', // Student enrolled classes
  STUDENT_ASSIGNMENTS: '/student/assignments', // Student assignments from enrolled classes
} as const;

