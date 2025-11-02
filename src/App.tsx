import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentAuthProvider } from "@/contexts/StudentAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TeacherAuth from "./pages/teacher/Auth";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherNotes from "./pages/teacher/Notes";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherProfile from "./pages/teacher/Profile";
import StudentAuth from "./pages/student/Auth";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentClasses from "./pages/student/Classes";
import StudentAssignments from "./pages/student/Assignments";
import StudentGrades from "./pages/student/Grades";
import StudentNotifications from "./pages/student/Notifications";
import StudentNotes from "./pages/student/Notes";
import StudentProfile from "./pages/student/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <StudentAuthProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/auth" element={<TeacherAuth />} />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute>
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/notes"
              element={
                <ProtectedRoute>
                  <TeacherNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/grades"
              element={
                <ProtectedRoute>
                  <TeacherGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute>
                  <TeacherProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route path="/student/auth" element={<StudentAuth />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/classes" element={<StudentClasses />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/grades" element={<StudentGrades />} />
            <Route path="/student/notes" element={<StudentNotes />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </StudentAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
