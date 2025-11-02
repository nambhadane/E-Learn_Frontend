import { assignmentApi, StudentAssignment } from './assignmentApi';
import { studentClassApi } from './studentClassApi';

export interface Notification {
  id: string;
  type: 'assignment' | 'grade' | 'notes' | 'deadline' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: number; // ID of related assignment/grade/note
  relatedType?: 'assignment' | 'submission' | 'lesson';
  className?: string;
}

export const notificationApi = {
  // Generate notifications from student data
  getStudentNotifications: async (): Promise<{ success: boolean; data?: Notification[]; error?: string }> => {
    try {
      const notifications: Notification[] = [];

      // Fetch all necessary data
      const [assignmentsRes, classesRes] = await Promise.all([
        assignmentApi.getStudentAssignments(),
        studentClassApi.getMyClasses(),
      ]);

      const assignments = assignmentsRes.success && assignmentsRes.data ? assignmentsRes.data : [];
      const classes = classesRes.success && classesRes.data ? classesRes.data : [];

      const now = new Date();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      // Process assignments to generate notifications
      assignments.forEach((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const timeUntilDue = dueDate.getTime() - now.getTime();

        // Notification: New assignment (if created recently, within last 7 days)
        // Note: We don't have assignment created date, so we'll use a simple heuristic
        if (assignment.status === 'pending' && timeUntilDue > 0) {
          notifications.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: 'New Assignment',
            message: `New assignment "${assignment.title}" posted in ${assignment.className || 'your class'}`,
            timestamp: assignment.dueDate, // Use due date as reference
            read: false,
            relatedId: assignment.id,
            relatedType: 'assignment',
            className: assignment.className,
          });
        }

        // Notification: Grade received
        if (assignment.status === 'graded' && assignment.grade !== null && assignment.grade !== undefined) {
          notifications.push({
            id: `grade-${assignment.id}`,
            type: 'grade',
            title: 'Grade Received',
            message: `You received ${assignment.grade}/${assignment.maxGrade || 100} for "${assignment.title}"`,
            timestamp: assignment.submittedAt || assignment.dueDate,
            read: false,
            relatedId: assignment.id,
            relatedType: 'submission',
            className: assignment.className,
          });
        }

        // Notification: Deadline approaching (within 3 days)
        if (assignment.status === 'pending' && timeUntilDue > 0 && timeUntilDue <= threeDaysMs) {
          const daysUntilDue = Math.ceil(timeUntilDue / oneDayMs);
          notifications.push({
            id: `deadline-${assignment.id}`,
            type: 'deadline',
            title: 'Deadline Approaching',
            message: `Assignment "${assignment.title}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            timestamp: assignment.dueDate,
            read: false,
            relatedId: assignment.id,
            relatedType: 'assignment',
            className: assignment.className,
          });
        }
      });

      // Notes notifications - optional, only if needed
      // We'll skip notes notifications to avoid too many API calls
      // Can be enabled later if needed
      // For now, students can check notes page manually

      // Sort notifications by timestamp (newest first)
      notifications.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      // Limit to 50 most recent notifications
      const limitedNotifications = notifications.slice(0, 50);

      return {
        success: true,
        data: limitedNotifications,
      };
    } catch (error) {
      console.error('Error generating notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      };
    }
  },

  // Mark notification as read (stored in localStorage for now)
  markAsRead: (notificationId: string) => {
    try {
      const readNotifications = JSON.parse(
        localStorage.getItem('readNotifications') || '[]'
      ) as string[];
      
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: () => {
    try {
      // Get all notification IDs from current notifications
      // This will be called after fetching notifications
      const notifications = JSON.parse(
        localStorage.getItem('currentNotifications') || '[]'
      ) as Notification[];
      
      const allIds = notifications.map(n => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(allIds));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Get read notification IDs
  getReadNotificationIds: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('readNotifications') || '[]') as string[];
    } catch {
      return [];
    }
  },
};

