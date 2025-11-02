# Student Authentication Implementation

## Summary
Implemented real backend API integration for student login and registration, replacing the localStorage mock data with actual API calls.

## Files Created

### 1. `src/lib/api/studentApi.ts`
- Student API client with methods for:
  - `login()` - Authenticate student
  - `register()` - Create new student account
  - `getProfile()` - Fetch student profile
  - `updateProfile()` - Update student information
  - `uploadProfilePicture()` - Upload profile picture

### 2. `src/contexts/StudentAuthContext.tsx`
- Student authentication context provider
- Manages student authentication state
- Handles token storage and retrieval
- Provides `useStudentAuth()` hook
- Separate from teacher auth to avoid conflicts

## Files Modified

### 1. `src/lib/api/config.ts`
- Added student endpoints:
  - `STUDENT_PROFILE: '/student/profile'`
  - `STUDENT_DASHBOARD: '/student/dashboard'`

### 2. `src/lib/api/client.ts`
- Updated `getAuthToken()` to check both:
  - `studentAuthToken` (for student API calls)
  - `authToken` (for teacher API calls)
- Falls back to teacher token if student token not found

### 3. `src/pages/student/Auth.tsx`
- Replaced localStorage mock with real API calls
- Uses `useStudentAuth()` hook
- Added loading states
- Improved error handling
- Matches teacher auth flow

### 4. `src/App.tsx`
- Added `StudentAuthProvider` wrapper
- Both `AuthProvider` and `StudentAuthProvider` are now available

## How It Works

### Student Login Flow:
1. User enters username and password
2. Calls `studentApi.login()` → `POST /auth/login`
3. Backend returns JWT token
4. Token stored in `localStorage` as `studentAuthToken`
5. Student data stored in `localStorage` as `currentStudent`
6. Automatically fetches student profile if endpoint exists
7. Redirects to `/student/dashboard`

### Student Registration Flow:
1. User fills registration form (name, email, username, password)
2. Calls `studentApi.register()` → `POST /auth/register`
3. Backend creates student account
4. Shows success message
5. Switches to login form
6. User can now login

### Token Management:
- **Student Token**: `studentAuthToken` in localStorage
- **Teacher Token**: `authToken` in localStorage
- API client automatically uses the correct token based on what's available

## Backend Requirements

Your Spring Boot backend should provide:

### 1. Login Endpoint
```
POST /auth/login
Request Body: { username: string, password: string }
Response: { token: string }
```

**Note**: The backend should distinguish between student and teacher roles. Options:
- Separate endpoints: `/auth/student/login` and `/auth/teacher/login`
- Or use role-based authentication based on user type in database
- Or check user role from username

### 2. Registration Endpoint
```
POST /auth/register
Request Body: { 
  name: string, 
  email: string, 
  username: string, 
  password: string 
}
Response: { message?: string, token?: string }
```

**Note**: The backend should:
- Create user with `ROLE_STUDENT`
- Hash password before storing
- Validate username uniqueness
- Return appropriate error messages

### 3. Student Profile Endpoint (Optional)
```
GET /student/profile
Headers: Authorization: Bearer <token>
Response: { 
  id?: number,
  name?: string,
  email?: string,
  username: string,
  profilePicture?: string,
  rollNumber?: string
}
```

## Usage in Components

### Use Student Auth Hook:
```tsx
import { useStudentAuth } from '@/contexts/StudentAuthContext';

const MyComponent = () => {
  const { student, isAuthenticated, login, register, logout } = useStudentAuth();
  
  // Check if student is logged in
  if (isAuthenticated) {
    // Show student dashboard
  }
  
  // Login
  const handleLogin = async () => {
    const result = await login(username, password);
    if (result.success) {
      // Redirect to dashboard
    }
  };
  
  return (
    // Component JSX
  );
};
```

## Testing Checklist

- [ ] Student can register with name, email, username, password
- [ ] Registration shows success message
- [ ] Student can login with registered credentials
- [ ] Login stores token in localStorage
- [ ] Login redirects to `/student/dashboard`
- [ ] Student profile is fetched after login (if endpoint exists)
- [ ] Logout clears student data and redirects to `/student/auth`
- [ ] Error messages display correctly for invalid credentials
- [ ] Loading states work during API calls

## Differences from Teacher Auth

1. **Separate Context**: `StudentAuthContext` vs `AuthContext`
2. **Separate Tokens**: `studentAuthToken` vs `authToken`
3. **Separate Storage Keys**: `currentStudent` vs `currentTeacher`
4. **Same API Endpoints**: Both use `/auth/login` and `/auth/register`

## Future Enhancements

1. **Role-based Backend**: Implement separate student/teacher login endpoints if needed
2. **Profile Picture**: Implement profile picture upload for students
3. **Protected Routes**: Create `ProtectedStudentRoute` component
4. **Session Management**: Add token refresh mechanism
5. **Remember Me**: Add "Remember Me" checkbox option

## Notes

- The backend must distinguish between student and teacher roles
- Both student and teacher tokens can coexist (separate localStorage keys)
- The API client automatically selects the correct token
- If student profile endpoint doesn't exist, login still works with just username

