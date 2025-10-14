// Mock data for the E-Learn Hub application

export const teacherData = {
  name: "Prof. Sharma",
  email: "sharma@elearn.edu",
  subject: "Computer Science",
  stats: {
    totalClasses: 5,
    totalStudents: 127,
    pendingAssignments: 12,
  },
  notifications: [
    { id: 1, message: "3 new assignment submissions", time: "2 hours ago" },
    { id: 2, message: "Student Rahul requested a meeting", time: "5 hours ago" },
    { id: 3, message: "Grade deadline approaching for CS101", time: "1 day ago" },
  ],
  classes: [
    { id: 1, name: "Data Structures", subject: "Computer Science", students: 45, description: "Advanced data structures and algorithms" },
    { id: 2, name: "Web Development", subject: "Computer Science", students: 38, description: "Full-stack web development fundamentals" },
    { id: 3, name: "Database Systems", subject: "Computer Science", students: 32, description: "Relational and NoSQL databases" },
    { id: 4, name: "Machine Learning", subject: "Computer Science", students: 28, description: "Introduction to ML algorithms" },
  ],
  notes: [
    { id: 1, title: "Introduction to Arrays", class: "Data Structures", date: "2025-01-10", fileType: "PDF" },
    { id: 2, title: "React Hooks Guide", class: "Web Development", date: "2025-01-08", fileType: "PPT" },
    { id: 3, title: "SQL Basics", class: "Database Systems", date: "2025-01-05", fileType: "PDF" },
  ],
  assignments: [
    { id: 1, title: "Implement Binary Search Tree", class: "Data Structures", dueDate: "2025-01-20", submissions: 35, total: 45 },
    { id: 2, title: "Build a React Portfolio", class: "Web Development", dueDate: "2025-01-18", submissions: 28, total: 38 },
    { id: 3, title: "Design ER Diagram", class: "Database Systems", dueDate: "2025-01-22", submissions: 30, total: 32 },
  ],
  submissions: [
    { id: 1, studentName: "Rahul Kumar", assignment: "Implement Binary Search Tree", submittedDate: "2025-01-15", grade: null, file: "rahul_bst.zip" },
    { id: 2, studentName: "Priya Sharma", assignment: "Implement Binary Search Tree", submittedDate: "2025-01-14", grade: 95, file: "priya_bst.zip" },
    { id: 3, studentName: "Amit Patel", assignment: "Build a React Portfolio", submittedDate: "2025-01-16", grade: 88, file: "amit_portfolio.zip" },
  ],
};

export const studentData = {
  name: "Nikita",
  email: "nikita@student.edu",
  rollNumber: "CS2023045",
  stats: {
    enrolledClasses: 4,
    pendingAssignments: 3,
    gradesReceived: 8,
  },
  classes: [
    { id: 1, name: "Data Structures", teacher: "Prof. Sharma", schedule: "Mon, Wed 10:00 AM" },
    { id: 2, name: "Web Development", teacher: "Prof. Sharma", schedule: "Tue, Thu 2:00 PM" },
    { id: 3, name: "Database Systems", teacher: "Prof. Kumar", schedule: "Fri 11:00 AM" },
    { id: 4, name: "Machine Learning", teacher: "Prof. Verma", schedule: "Wed 3:00 PM" },
  ],
  assignments: [
    { id: 1, title: "Implement Binary Search Tree", class: "Data Structures", dueDate: "2025-01-20", status: "pending", grade: null },
    { id: 2, title: "Build a React Portfolio", class: "Web Development", dueDate: "2025-01-18", status: "submitted", grade: null, submittedDate: "2025-01-16" },
    { id: 3, title: "Design ER Diagram", class: "Database Systems", dueDate: "2025-01-22", status: "pending", grade: null },
    { id: 4, title: "Sorting Algorithm Analysis", class: "Data Structures", dueDate: "2025-01-05", status: "graded", grade: 95, submittedDate: "2025-01-03" },
    { id: 5, title: "HTML/CSS Landing Page", class: "Web Development", dueDate: "2025-01-10", status: "graded", grade: 88, submittedDate: "2025-01-09" },
  ],
  notifications: [
    { id: 1, message: "New assignment posted in Data Structures", time: "1 hour ago", type: "assignment" },
    { id: 2, message: "Grade posted for React Portfolio", time: "3 hours ago", type: "grade" },
    { id: 3, message: "New notes uploaded in Database Systems", time: "1 day ago", type: "notes" },
    { id: 4, message: "Assignment deadline approaching: ER Diagram", time: "2 days ago", type: "reminder" },
  ],
};
