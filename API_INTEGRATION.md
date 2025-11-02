# API Integration Guide

This document explains how the frontend is connected to the Spring Boot backend.

## Environment Setup

1. Create a `.env` file in the `class-nest-portal` directory:

```env
VITE_API_BASE_URL=http://localhost:8081
```

**Note:** 
- Update the port (8081) to match your Spring Boot backend port
- The base URL should NOT include `/api` since the endpoints start with `/auth`

## API Configuration

The API configuration is located in `src/lib/api/config.ts`. Here you can find:
- Base URL configuration
- API endpoints for teacher operations

## Authentication Flow

1. **Login**: 
   - POST `/auth/login`
   - Request body: `{ username: string, password: string }`
   - Response: `{ token: string }`
   - After login, the frontend automatically attempts to fetch the teacher profile if that endpoint exists

2. **Register**:
   - POST `/auth/register` (if available)
   - Request body: `{ username: string, password: string, name?: string, email?: string }`
   - Response: `{ message?: string }`

## Token Management

- Tokens are stored in `localStorage` as `authToken`
- The token is automatically included in all API requests via the `Authorization: Bearer <token>` header
- The `AuthContext` manages authentication state across the application

## Protected Routes

All teacher routes (dashboard, classes, notes, assignments, grades, profile) are protected and require authentication. Unauthenticated users are redirected to `/teacher/auth`.

## Backend API Requirements

Your Spring Boot backend should provide the following endpoints:

### Auth Endpoints

1. **POST** `/auth/login`
   - Request Body: `{ username: string, password: string }`
   - Response: `{ token: string }` (Status: 200)
   - Example:
     ```java
     @PostMapping("/login")
     public ResponseEntity<?> login(@RequestBody User loginRequest) {
         // Authentication logic
         String token = jwtUtil.generateToken(...);
         return ResponseEntity.ok(new JwtResponse(token));
     }
     ```

2. **POST** `/auth/register` (if available)
   - Request Body: `{ username: string, password: string, name?: string, email?: string }`
   - Response: `{ message?: string, token?: string }`
   - Status: 200 or 201 on success, 400/409 on failure

### Teacher Endpoints (Optional)

3. **GET** `/teacher/profile` (if available)
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ id?, name?, email?, username: string }`
   - Status: 200 on success, 401 on unauthorized

4. **GET** `/teacher/dashboard` (if available)
   - Headers: `Authorization: Bearer <token>`
   - Response: Dashboard data (customize as needed)
   - Status: 200 on success, 401 on unauthorized

## CORS Configuration

Make sure your Spring Boot backend has CORS configured to allow requests from your frontend:

```java
@CrossOrigin(origins = "http://localhost:8080") // Or your frontend URL
```

## Testing

1. Start your Spring Boot backend
2. Make sure the `.env` file has the correct API URL
3. Run `npm run dev` in the `class-nest-portal` directory
4. Navigate to `/teacher/auth` and try logging in or registering

## Customization

If your backend API endpoints differ, update:
1. `src/lib/api/config.ts` - API endpoint paths
2. `src/lib/api/teacherApi.ts` - API request/response types and logic

