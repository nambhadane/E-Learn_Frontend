import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi, Student } from '@/lib/api/studentApi';

interface StudentAuthContextType {
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateStudent: (studentData: Student) => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const StudentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('studentAuthToken');
    const storedStudent = localStorage.getItem('currentStudent');
    const storedUsername = localStorage.getItem('studentUsername');

    if (token && storedStudent) {
      try {
        const studentData = JSON.parse(storedStudent);
        setStudent(studentData);
        
        // Ensure studentUsername matches the student data
        if (studentData.username && studentData.username !== storedUsername) {
          localStorage.setItem('studentUsername', studentData.username);
        }
        
        // Try to refresh profile data if token exists
        studentApi.getProfile()
          .then(profileResponse => {
            if (profileResponse.success && profileResponse.data) {
              const profileData = profileResponse.data;
              setStudent(profileData);
              localStorage.setItem('currentStudent', JSON.stringify(profileData));
              // Ensure username is preserved in localStorage
              if (profileData.username) {
                localStorage.setItem('studentUsername', profileData.username);
              }
            }
          })
          .catch(() => {
            // Profile endpoint might not exist, use stored data
            // But still ensure username is set
            if (studentData.username) {
              localStorage.setItem('studentUsername', studentData.username);
            }
          });
      } catch (error) {
        console.error('Error parsing stored student data:', error);
        localStorage.removeItem('studentAuthToken');
        localStorage.removeItem('currentStudent');
        localStorage.removeItem('studentUsername');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await studentApi.login({ username, password });

      if (response.success && response.data) {
        const { token } = response.data;
        
        // Store token with student-specific key
        localStorage.setItem('studentAuthToken', token);
        localStorage.setItem('studentUsername', username);
        
        // Create temporary student object with username
        const studentData: Student = { username };
        localStorage.setItem('currentStudent', JSON.stringify(studentData));
        setStudent(studentData);

        // Try to fetch full profile if endpoint exists
        try {
          const profileResponse = await studentApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setStudent(profileResponse.data);
            localStorage.setItem('currentStudent', JSON.stringify(profileResponse.data));
          }
        } catch (profileError) {
          // Profile endpoint might not exist yet, that's okay
          console.log('Profile fetch not available:', profileError);
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || response.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const register = async (name: string, email: string, username: string, password: string) => {
    try {
      const response = await studentApi.register({ name, email, username, password });

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || response.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('studentAuthToken');
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('studentUsername');
    setStudent(null);
    navigate('/student/auth');
  };

  const updateStudent = (studentData: Student) => {
    setStudent(studentData);
    localStorage.setItem('currentStudent', JSON.stringify(studentData));
    if (studentData.username) {
      localStorage.setItem('studentUsername', studentData.username);
    }
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isLoading,
        login,
        register,
        logout,
        updateStudent,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

