import { useState, useEffect, useRef } from "react";
import { BookOpen, FileText, Trophy, Bell, User as UserIcon, Mail, Hash, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentApi } from "@/lib/api/studentApi";
import { studentClassApi } from "@/lib/api/studentClassApi";
import { assignmentApi } from "@/lib/api/assignmentApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: UserIcon },
];

const Profile = () => {
  const { student, updateStudent } = useStudentAuth();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });

  const [stats, setStats] = useState({
    enrolledClasses: 0,
    pendingAssignments: 0,
    gradesReceived: 0,
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, []);

  useEffect(() => {
    // Initialize form data from student context
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        username: student.username || "",
      });
      setProfilePicture(student.profilePicture || null);
    }
  }, [student]);

  // Load profile picture
  useEffect(() => {
    const loadProfilePicture = async () => {
      const picturePath = profilePicture || student?.profilePicture;
      
      // Cleanup old blob URL first
      if (profileBlobUrlRef.current) {
        URL.revokeObjectURL(profileBlobUrlRef.current);
        profileBlobUrlRef.current = null;
      }
      
      if (!picturePath || picturePath.trim() === '') {
        setProfileImageUrl(null);
        return;
      }

      // If it's already a full URL, use it directly
      if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) {
        setProfileImageUrl(picturePath);
        return;
      }

      // Only try to fetch if we have a valid path that looks like a profile picture path
      // Skip if endpoint doesn't exist or path is invalid
      if (!picturePath.includes('/profiles/') && !picturePath.includes('profile')) {
        setProfileImageUrl(null);
        return;
      }

      // Fetch image with authentication token
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
        const token = localStorage.getItem('studentAuthToken');
        
        if (!token) {
          setProfileImageUrl(null);
          return;
        }

        // Add timestamp to prevent caching issues
        const timestamp = Date.now();
        const response = await fetch(`${apiBase}/student/profile/picture?t=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        // Check if response is OK and content type is an image
        if (response.ok && response.status === 200) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            const blob = await response.blob();
            
            // Verify it's an image
            if (blob.type.startsWith('image/')) {
              const url = URL.createObjectURL(blob);
              profileBlobUrlRef.current = url;
              setProfileImageUrl(url);
              return;
            }
          }
        }
        
        // If we get here, the fetch failed or wasn't an image
        // This could mean the endpoint doesn't exist yet, which is fine
        setProfileImageUrl(null);
      } catch (error) {
        // Silently fail if endpoint doesn't exist - this is expected if backend hasn't implemented it yet
        // Only log if it's not a 404 or static resource error
        if (error instanceof Error && !error.message.includes('static resource') && !error.message.includes('404')) {
          console.log('Profile picture endpoint may not be available:', error.message);
        }
        setProfileImageUrl(null);
      }
    };

    loadProfilePicture();

    // Cleanup on unmount
    return () => {
      if (profileBlobUrlRef.current) {
        URL.revokeObjectURL(profileBlobUrlRef.current);
        profileBlobUrlRef.current = null;
      }
    };
  }, [profilePicture, student?.profilePicture]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await studentApi.getProfile();
      
      if (response.success && response.data) {
        const profileData = response.data;
        updateStudent(profileData);
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          username: profileData.username || "",
        });
        setProfilePicture(profileData.profilePicture || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Use existing student data from context if API fails
      if (student) {
        setFormData({
          name: student.name || "",
          email: student.email || "",
          username: student.username || "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch enrolled classes
      const classesResponse = await studentClassApi.getMyClasses();
      const classes = classesResponse.success && classesResponse.data ? classesResponse.data : [];
      
      // Fetch assignments
      const assignmentsResponse = await assignmentApi.getStudentAssignments();
      const assignments = assignmentsResponse.success && assignmentsResponse.data ? assignmentsResponse.data : [];
      
      const pendingCount = assignments.filter(a => a.status === 'pending').length;
      const gradedCount = assignments.filter(a => a.status === 'graded').length;
      
      setStats({
        enrolledClasses: classes.length,
        pendingAssignments: pendingCount,
        gradesReceived: gradedCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const response = await studentApi.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (response.success && response.data) {
        toast.success("Profile updated successfully!");
        
        // Update auth context with new data
        const updatedStudent = {
          ...student, // Preserve existing data
          ...response.data, // Override with updated data
          name: response.data.name || formData.name.trim(),
          email: response.data.email || formData.email.trim(),
        };
        updateStudent(updatedStudent);
        
        // Refresh profile from server to get latest data
        try {
          const profileResponse = await studentApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            updateStudent(profileResponse.data);
            setFormData(prev => ({
              ...prev,
              name: profileResponse.data?.name || prev.name,
              email: profileResponse.data?.email || prev.email,
            }));
          }
        } catch (profileError) {
          console.log('Profile refresh not available:', profileError);
        }
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
      const response = await studentApi.uploadProfilePicture(file);

      if (response.success && response.data) {
        toast.success("Profile picture updated successfully!");
        
        // Update auth context with new data
        const updatedStudent = {
          ...student, // Preserve existing data
          ...response.data, // Override with updated data
          profilePicture: response.data.profilePicture, // Ensure profile picture path is set
        };
        updateStudent(updatedStudent);
        
        // Update profile picture state to trigger useEffect
        const picturePath = response.data.profilePicture || null;
        setProfilePicture(picturePath);
        
        // Force refresh by clearing and resetting the image URL
        if (profileBlobUrlRef.current) {
          URL.revokeObjectURL(profileBlobUrlRef.current);
          profileBlobUrlRef.current = null;
        }
        setProfileImageUrl(null);
        
        // Small delay to ensure state updates before re-fetching
        setTimeout(() => {
          // The useEffect will trigger and fetch the new image
        }, 100);
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

  const handleCancel = () => {
    // Reset form to original student data
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        username: student.username || "",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 shadow-card">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground mb-2">Update your profile photo</p>
                    <div className="flex gap-2">
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
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingPicture ? "Uploading..." : "Change Photo"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      disabled
                      className="bg-secondary"
                      placeholder="Username"
                    />
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>

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
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Academic Stats */}
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Academic Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{stats.enrolledClasses}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{stats.pendingAssignments}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{stats.gradesReceived}</p>
                <p className="text-sm text-muted-foreground">Graded</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
