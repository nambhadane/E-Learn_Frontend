import { BookOpen, Users, FileText, Mail, User as UserIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teacherData } from "@/data/mockData";
import { toast } from "sonner";

const teacherNavItems = [
  { title: "Dashboard", path: "/teacher/dashboard", icon: BookOpen },
  { title: "Classes", path: "/teacher/classes", icon: Users },
  { title: "Notes", path: "/teacher/notes", icon: FileText },
  { title: "Assignments", path: "/teacher/assignments", icon: FileText },
  { title: "Grades", path: "/teacher/grades", icon: FileText },
  { title: "Profile", path: "/teacher/profile", icon: Users },
];

const Profile = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherData.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 shadow-card">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-2">Update your profile photo</p>
                  <Button type="button" variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={teacherData.name}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={teacherData.email}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    defaultValue={teacherData.subject}
                    placeholder="Your subject area"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          {/* Stats Card */}
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Account Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{teacherData.stats.totalClasses}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{teacherData.stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{teacherData.assignments.length}</p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
