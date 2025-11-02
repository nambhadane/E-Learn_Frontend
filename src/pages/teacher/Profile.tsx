import { useState, useEffect, useRef } from "react";
import { BookOpen, Users, FileText, Mail, User as UserIcon, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, Class } from "@/lib/api/classApi";
import { assignmentApi } from "@/lib/api/assignmentApi";
import { teacherApi } from "@/lib/api/teacherApi";
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
  const { teacher, updateTeacher } = useAuth();
  const teacherName = teacher?.name || teacher?.username || "Teacher";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileBlobUrlRef = useRef<string | null>(null);
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: teacher?.name || "",
    email: teacher?.email || "",
    subject: "", // Subject can be added later if available
  });

  useEffect(() => {
    fetchStats();
    if (teacher?.name) {
      setFormData(prev => ({ ...prev, name: teacher.name || "" }));
    }
    if (teacher?.email) {
      setFormData(prev => ({ ...prev, email: teacher.email || "" }));
    }
    if (teacher?.profilePicture) {
      setProfilePicture(teacher.profilePicture);
    }
  }, [teacher]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // Fetch classes
      const classesResponse = await classApi.getClasses();
      if (classesResponse.success && classesResponse.data) {
        setClasses(classesResponse.data);
        
        // Fetch assignments for each class to get total count
        let assignmentCount = 0;
        for (const classItem of classesResponse.data) {
          if (classItem.id) {
            try {
              const assignmentsResponse = await assignmentApi.getAssignmentsByClass(classItem.id);
              if (assignmentsResponse.success && assignmentsResponse.data) {
                assignmentCount += assignmentsResponse.data.length;
              }
            } catch (error) {
              // Skip if error fetching assignments for this class
            }
          }
        }
        setTotalAssignments(assignmentCount);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await teacherApi.updateProfile({
        name: formData.name,
        email: formData.email,
      });

      if (response.success && response.data) {
        toast.success("Profile updated successfully!");
        // Update auth context directly so UI updates immediately
        const updatedTeacher = response.data;
        updateTeacher(updatedTeacher);
        // Also update formData to reflect changes
        setFormData({
          name: updatedTeacher.name || "",
          email: updatedTeacher.email || "",
          subject: formData.subject,
        });
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Calculate total students (this would need an API endpoint)
  const totalStudents = classes.reduce((sum, classItem) => {
    // Assuming classItem has a students property or we'd need to fetch enrollments
    return sum + (classItem.students || 0);
  }, 0);

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploadingPicture(true);
      const response = await teacherApi.uploadProfilePicture(file);

      if (response.success && response.data) {
        toast.success("Profile picture updated successfully!");
        // Update auth context directly so UI updates immediately
        const updatedTeacher = response.data;
        updateTeacher(updatedTeacher);
        // Update profile picture state
        setProfilePicture(updatedTeacher.profilePicture || null);
      } else {
        toast.error(response.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Load profile picture with authentication
  useEffect(() => {
    const loadProfilePicture = async () => {
      const picturePath = profilePicture || teacher?.profilePicture;
      if (!picturePath) {
        // Cleanup old blob URL
        if (profileBlobUrlRef.current) {
          URL.revokeObjectURL(profileBlobUrlRef.current);
          profileBlobUrlRef.current = null;
        }
        setProfileImageUrl(null);
        return;
      }

      // If it's already a full URL, use it directly
      if (picturePath.startsWith('http')) {
        // Cleanup old blob URL
        if (profileBlobUrlRef.current) {
          URL.revokeObjectURL(profileBlobUrlRef.current);
          profileBlobUrlRef.current = null;
        }
        setProfileImageUrl(picturePath);
        return;
      }

      // Fetch image with authentication token
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setProfileImageUrl(null);
          return;
        }

        // Cleanup old blob URL before creating new one
        if (profileBlobUrlRef.current) {
          URL.revokeObjectURL(profileBlobUrlRef.current);
          profileBlobUrlRef.current = null;
        }

        const response = await fetch(`${apiBase}/teacher/profile/picture?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          profileBlobUrlRef.current = url;
          setProfileImageUrl(url);
        } else {
          setProfileImageUrl(null);
        }
      } catch (error) {
        console.error('Error loading profile picture:', error);
        setProfileImageUrl(null);
      }
    };

    loadProfilePicture();
    
    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (profileBlobUrlRef.current) {
        URL.revokeObjectURL(profileBlobUrlRef.current);
        profileBlobUrlRef.current = null;
      }
    };
  }, [profilePicture, teacher?.profilePicture]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={teacherNavItems} userType="teacher" userName={teacherName} />
      
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
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border relative">
                  {profileImageUrl ? (
                    <img 
                      key={`profile-img-${Date.now()}`}
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        setProfileImageUrl(null);
                      }}
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-2">Update your profile photo</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangePhotoClick}
                    disabled={isUploadingPicture}
                  >
                    {isUploadingPicture ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Your subject area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={teacher?.username || ""}
                    disabled
                    placeholder="Username (cannot be changed)"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{classes.length}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{totalAssignments}</p>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
