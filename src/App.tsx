import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherNotes from "./pages/teacher/Notes";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherProfile from "./pages/teacher/Profile";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentClasses from "./pages/student/Classes";
import StudentAssignments from "./pages/student/Assignments";
import StudentGrades from "./pages/student/Grades";
import StudentNotifications from "./pages/student/Notifications";
import StudentProfile from "./pages/student/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/notes" element={<TeacherNotes />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/grades" element={<TeacherGrades />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/classes" element={<StudentClasses />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/grades" element={<StudentGrades />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
