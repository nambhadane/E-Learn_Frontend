import { useState, useEffect } from "react";
import { BookOpen, FileText, Trophy, Bell, User, AlertCircle, CheckCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { notificationApi, Notification } from "@/lib/api/notificationApi";
import { toast } from "sonner";

const studentNavItems = [
  { title: "Dashboard", path: "/student/dashboard", icon: BookOpen },
  { title: "Classes", path: "/student/classes", icon: BookOpen },
  { title: "Assignments", path: "/student/assignments", icon: FileText },
  { title: "Grades", path: "/student/grades", icon: Trophy },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Profile", path: "/student/profile", icon: User },
];

const getNotificationIcon = (type: string) => {
  const icons = {
    assignment: FileText,
    grade: Trophy,
    notes: BookOpen,
    deadline: AlertCircle,
    reminder: AlertCircle,
  };
  return icons[type as keyof typeof icons] || Bell;
};

const getNotificationColor = (type: string) => {
  const colors = {
    assignment: "text-primary",
    grade: "text-success",
    notes: "text-accent",
    deadline: "text-warning",
    reminder: "text-warning",
  };
  return colors[type as keyof typeof colors] || "text-primary";
};

const getNotificationBadgeColor = (type: string) => {
  const colors = {
    assignment: "bg-primary/10 text-primary border-primary",
    grade: "bg-success/10 text-success border-success",
    notes: "bg-accent/10 text-accent border-accent",
    deadline: "bg-warning/10 text-warning border-warning",
    reminder: "bg-warning/10 text-warning border-warning",
  };
  return colors[type as keyof typeof colors] || "bg-primary/10 text-primary border-primary";
};

const formatTimeAgo = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return timestamp;
  }
};

const Notifications = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const studentName = (student?.name && student.name.trim() !== '') 
    ? student.name 
    : (student?.username || "Student");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    loadReadNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getStudentNotifications();
      
      if (response.success && response.data) {
        // Mark read status
        const readIds = notificationApi.getReadNotificationIds();
        const notificationsWithRead = response.data.map(notif => ({
          ...notif,
          read: readIds.includes(notif.id),
        }));
        
        setNotifications(notificationsWithRead);
        // Store for mark all as read functionality
        localStorage.setItem('currentNotifications', JSON.stringify(response.data));
      } else {
        toast.error(response.error || "Failed to load notifications");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications. Please try again.");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadNotifications = () => {
    const readIds = notificationApi.getReadNotificationIds();
    setReadIds(readIds);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      notificationApi.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setReadIds(prev => [...prev, notification.id]);
    }

    // Navigate based on type
    if (notification.relatedType === 'assignment' || notification.type === 'deadline') {
      navigate(`/student/assignments`);
    } else if (notification.relatedType === 'submission' || notification.type === 'grade') {
      navigate(`/student/grades`);
    } else if (notification.relatedType === 'lesson' || notification.type === 'notes') {
      navigate(`/student/notes`);
    }
  };

  const handleMarkAllAsRead = () => {
    notificationApi.markAllAsRead();
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    localStorage.removeItem('readNotifications');
    localStorage.removeItem('currentNotifications');
    setReadIds([]);
    fetchNotifications();
    toast.success("Notifications cleared");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={studentNavItems} userType="student" userName={studentName} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">Stay updated with your courses</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  {unreadCount} New
                </Badge>
              )}
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="gap-2"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                const badgeColor = getNotificationBadgeColor(notification.type);

                return (
                  <Card
                    key={notification.id}
                    className={`p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-secondary rounded-lg flex-shrink-0 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 break-words">
                              {notification.message}
                            </p>
                            {notification.className && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Class: {notification.className}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className={`capitalize ${badgeColor}`}>
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
