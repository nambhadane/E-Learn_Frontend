import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi, Teacher } from '@/lib/api/teacherApi';

interface AuthContextType {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateTeacher: (teacherData: Teacher) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedTeacher = localStorage.getItem('currentTeacher');
    const storedUsername = localStorage.getItem('teacherUsername');

    if (token && storedTeacher) {
      try {
        const teacherData = JSON.parse(storedTeacher);
        setTeacher(teacherData);
        
        // Ensure teacherUsername matches the teacher data
        if (teacherData.username && teacherData.username !== storedUsername) {
          localStorage.setItem('teacherUsername', teacherData.username);
        }
        
        // Try to refresh profile data if token exists
        teacherApi.getProfile()
          .then(profileResponse => {
            if (profileResponse.success && profileResponse.data) {
              const profileData = profileResponse.data;
              setTeacher(profileData);
              localStorage.setItem('currentTeacher', JSON.stringify(profileData));
              // Ensure username is preserved in localStorage
              if (profileData.username) {
                localStorage.setItem('teacherUsername', profileData.username);
              }
            }
          })
          .catch(() => {
            // Profile endpoint might not exist, use stored data
            // But still ensure username is set
            if (teacherData.username) {
              localStorage.setItem('teacherUsername', teacherData.username);
            }
          });
      } catch (error) {
        console.error('Error parsing stored teacher data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentTeacher');
        localStorage.removeItem('teacherUsername');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await teacherApi.login({ username, password });

      if (response.success && response.data) {
        const { token } = response.data;
        
        // Store token
        localStorage.setItem('authToken', token);
        localStorage.setItem('teacherUsername', username);
        
        // Create temporary teacher object with username
        // You can fetch full profile later if you have a profile endpoint
        const teacherData: Teacher = { username };
        localStorage.setItem('currentTeacher', JSON.stringify(teacherData));
        setTeacher(teacherData);

        // Try to fetch full profile if endpoint exists
        try {
          const profileResponse = await teacherApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setTeacher(profileResponse.data);
            localStorage.setItem('currentTeacher', JSON.stringify(profileResponse.data));
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
      const response = await teacherApi.register({ name, email, username, password });

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
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentTeacher');
    localStorage.removeItem('teacherUsername');
    setTeacher(null);
    navigate('/teacher/auth');
  };

  const updateTeacher = (teacherData: Teacher) => {
    setTeacher(teacherData);
    localStorage.setItem('currentTeacher', JSON.stringify(teacherData));
    if (teacherData.username) {
      localStorage.setItem('teacherUsername', teacherData.username);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        isAuthenticated: !!teacher,
        isLoading,
        login,
        register,
        logout,
        updateTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

