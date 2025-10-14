import { useNavigate } from "react-router-dom";
import { GraduationCap, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-2xl shadow-lg">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground">E-Learn Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern classroom and assignment management system for teachers and students
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Teacher Card */}
          <Card className="p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary group">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <UserCheck className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Teacher Portal</h2>
                <p className="text-muted-foreground">
                  Manage classes, upload notes, create assignments, and grade student work
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/teacher/dashboard")}
              >
                Continue as Teacher
              </Button>
            </div>
          </Card>

          {/* Student Card */}
          <Card className="p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary group">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Student Portal</h2>
                <p className="text-muted-foreground">
                  Access classes, submit assignments, view grades, and track your progress
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/student/dashboard")}
              >
                Continue as Student
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by modern web technologies • Responsive design • Real-time updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
