// ============================================
// Mock Data - Google Classroom Clone (Expanded)
// ============================================
import { User, ClassRoom, Assignment, Submission, Notification, Announcement } from '../types';

// ---- Users ----
export const mockUsers: User[] = [
    { id: 'u1', email: 'john.teacher@school.edu', name: 'Dr. John Smith', avatar: '', role: 'faculty', createdAt: '2025-08-15T10:00:00Z' },
    { id: 'u2', email: 'sarah.student@school.edu', name: 'Sarah Johnson', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u3', email: 'mike.student@school.edu', name: 'Mike Chen', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u4', email: 'emma.student@school.edu', name: 'Emma Williams', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u5', email: 'admin@school.edu', name: 'Admin User', avatar: '', role: 'admin', createdAt: '2025-01-01T10:00:00Z' },
    { id: 'u6', email: 'prof.garcia@school.edu', name: 'Prof. Maria Garcia', avatar: '', role: 'faculty', createdAt: '2025-08-15T10:00:00Z' },
    { id: 'u7', email: 'alex.student@school.edu', name: 'Alex Turner', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u8', email: 'priya.student@school.edu', name: 'Priya Patel', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u9', email: 'james.student@school.edu', name: 'James Wilson', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
    { id: 'u10', email: 'lisa.student@school.edu', name: 'Lisa Anderson', avatar: '', role: 'student', createdAt: '2025-09-01T10:00:00Z' },
];

// ---- Classes ----
export const mockClasses: ClassRoom[] = [
    { id: 'c1', name: 'Data Structures & Algorithms', section: 'Section A - Fall 2025', subject: 'Computer Science', room: 'Room 301', coverImage: '/covers/math.jpg', colorTheme: '#1967d2', code: 'abc123', createdBy: 'u1', teacherName: 'Dr. John Smith', teacherAvatar: '', studentCount: 35, createdAt: '2025-08-20T10:00:00Z' },
    { id: 'c2', name: 'Web Development', section: 'Section B - Fall 2025', subject: 'Computer Science', room: 'Lab 102', coverImage: '/covers/code.jpg', colorTheme: '#1e8e3e', code: 'def456', createdBy: 'u1', teacherName: 'Dr. John Smith', teacherAvatar: '', studentCount: 42, createdAt: '2025-08-20T10:00:00Z' },
    { id: 'c3', name: 'Machine Learning', section: 'Section A - Fall 2025', subject: 'Artificial Intelligence', room: 'Room 405', coverImage: '/covers/ai.jpg', colorTheme: '#e8710a', code: 'ghi789', createdBy: 'u6', teacherName: 'Prof. Maria Garcia', teacherAvatar: '', studentCount: 28, createdAt: '2025-08-22T10:00:00Z' },
    { id: 'c4', name: 'Database Systems', section: 'Section C - Fall 2025', subject: 'Computer Science', room: 'Room 201', coverImage: '/covers/db.jpg', colorTheme: '#a142f4', code: 'jkl012', createdBy: 'u6', teacherName: 'Prof. Maria Garcia', teacherAvatar: '', studentCount: 38, createdAt: '2025-08-22T10:00:00Z' },
    { id: 'c5', name: 'Operating Systems', section: 'Section A - Fall 2025', subject: 'Computer Science', room: 'Room 303', coverImage: '/covers/os.jpg', colorTheme: '#d93025', code: 'mno345', createdBy: 'u1', teacherName: 'Dr. John Smith', teacherAvatar: '', studentCount: 30, createdAt: '2025-08-25T10:00:00Z' },
];

// ---- Assignments ----
export const mockAssignments: Assignment[] = [
    {
        id: 'a1', classId: 'c1', title: 'Implement Binary Search Tree',
        description: 'Implement a Binary Search Tree with insert, delete, and search operations. Include unit tests.',
        instructions: 'Submit your code as a .zip file containing the source code and test files. Use proper naming conventions.',
        dueDate: '2026-03-10T23:59:00Z', dueTime: '11:59 PM', points: 100, topic: 'Trees',
        attachments: [
            { id: 'att1', name: 'BST_Requirements.pdf', type: 'file', url: '#', size: 245000, mimeType: 'application/pdf' },
            { id: 'att2', name: 'Reference Material', type: 'link', url: 'https://example.com/bst' },
        ],
        createdBy: 'u1', createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z',
        status: 'published', allowLateSubmission: true, maxFileSize: 10,
        allowedFormats: ['.zip', '.rar', '.pdf', '.java', '.py'],
        submissionCount: 20, gradedCount: 5,
        rubric: [
            { id: 'r1', title: 'Correctness', description: 'All operations work correctly', maxPoints: 40 },
            { id: 'r2', title: 'Code Quality', description: 'Clean, readable, well-documented code', maxPoints: 25 },
            { id: 'r3', title: 'Testing', description: 'Comprehensive test cases', maxPoints: 20 },
            { id: 'r4', title: 'Efficiency', description: 'Optimal time/space complexity', maxPoints: 15 },
        ],
    },
    {
        id: 'a2', classId: 'c1', title: 'Graph Traversal Algorithms',
        description: 'Implement BFS and DFS traversal algorithms. Compare their time complexities with practical examples.',
        dueDate: '2026-03-15T23:59:00Z', dueTime: '11:59 PM', points: 100, topic: 'Graphs',
        attachments: [],
        createdBy: 'u1', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
        status: 'published', allowLateSubmission: false, maxFileSize: 10,
        allowedFormats: ['.zip', '.pdf', '.py', '.java'],
        submissionCount: 12, gradedCount: 0,
    },
    {
        id: 'a3', classId: 'c2', title: 'Build a REST API',
        description: 'Create a RESTful API for a todo application using Node.js and Express. Include CRUD operations and proper error handling.',
        instructions: 'Deploy your API to a free hosting service. Submit the GitHub repo link and the deployed URL.',
        dueDate: '2026-03-08T23:59:00Z', dueTime: '11:59 PM', points: 150, topic: 'Backend Development',
        attachments: [{ id: 'att3', name: 'API_Spec.pdf', type: 'file', url: '#', size: 180000, mimeType: 'application/pdf' }],
        createdBy: 'u1', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z',
        status: 'published', allowLateSubmission: true, maxFileSize: 20,
        allowedFormats: ['.zip', '.pdf'],
        submissionCount: 35, gradedCount: 30,
        rubric: [
            { id: 'r5', title: 'API Design', description: 'RESTful endpoints, proper HTTP methods', maxPoints: 50 },
            { id: 'r6', title: 'Error Handling', description: 'Graceful error responses', maxPoints: 30 },
            { id: 'r7', title: 'Deployment', description: 'Successfully deployed and accessible', maxPoints: 30 },
            { id: 'r8', title: 'Documentation', description: 'API docs or README', maxPoints: 40 },
        ],
    },
    {
        id: 'a4', classId: 'c2', title: 'React Portfolio Project',
        description: 'Build a personal portfolio website using React. It should be responsive and include at least 4 pages.',
        dueDate: '2026-03-20T23:59:00Z', dueTime: '11:59 PM', points: 200, topic: 'Frontend Development',
        attachments: [],
        createdBy: 'u1', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
        status: 'published', allowLateSubmission: true, maxFileSize: 50,
        allowedFormats: ['.zip'],
        submissionCount: 8, gradedCount: 0,
    },
    {
        id: 'a5', classId: 'c3', title: 'Linear Regression Implementation',
        description: 'Implement linear regression from scratch (no sklearn). Use gradient descent optimization.',
        dueDate: '2026-03-12T23:59:00Z', dueTime: '11:59 PM', points: 100, topic: 'Supervised Learning',
        attachments: [{ id: 'att4', name: 'dataset.csv', type: 'file', url: '#', size: 52000, mimeType: 'text/csv' }],
        createdBy: 'u6', createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-02-28T10:00:00Z',
        status: 'published', allowLateSubmission: false, maxFileSize: 15,
        allowedFormats: ['.ipynb', '.py', '.pdf'],
        submissionCount: 18, gradedCount: 10,
    },
    {
        id: 'a6', classId: 'c4', title: 'ER Diagram Design',
        description: 'Design an ER diagram for a hospital management system. Include at least 8 entities with proper relationships.',
        dueDate: '2026-03-05T23:59:00Z', dueTime: '11:59 PM', points: 50, topic: 'Database Design',
        attachments: [],
        createdBy: 'u6', createdAt: '2026-02-22T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z',
        status: 'published', allowLateSubmission: true, maxFileSize: 5,
        allowedFormats: ['.pdf', '.png', '.jpg'],
        submissionCount: 32, gradedCount: 28,
    },
    {
        id: 'a7', classId: 'c5', title: 'Process Scheduling Simulation',
        description: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms. Generate Gantt charts and compare metrics.',
        dueDate: '2026-03-18T23:59:00Z', dueTime: '11:59 PM', points: 120, topic: 'Process Management',
        attachments: [],
        createdBy: 'u1', createdAt: '2026-03-02T10:00:00Z', updatedAt: '2026-03-02T10:00:00Z',
        status: 'published', allowLateSubmission: true, maxFileSize: 15,
        allowedFormats: ['.zip', '.py', '.java', '.pdf'],
        submissionCount: 5, gradedCount: 0,
    },
    {
        id: 'a8', classId: 'c1', title: 'Sorting Algorithm Analysis',
        description: 'Compare QuickSort, MergeSort, and HeapSort. Write a report with benchmarks.',
        dueDate: null, dueTime: undefined, points: 80, topic: 'Sorting',
        attachments: [],
        createdBy: 'u1', createdAt: '2026-03-02T10:00:00Z', updatedAt: '2026-03-02T10:00:00Z',
        status: 'draft', allowLateSubmission: true, maxFileSize: 10,
        allowedFormats: ['.pdf', '.zip'],
        submissionCount: 0, gradedCount: 0,
    },
];

// ---- Submissions ----
export const mockSubmissions: Submission[] = [
    // Student u2 (Sarah) submissions
    {
        id: 's1', assignmentId: 'a1', studentId: 'u2', studentName: 'Sarah Johnson', studentAvatar: '',
        files: [{ id: 'f1', name: 'BST_Implementation.zip', size: 245000, type: 'application/zip', url: '#', uploadedAt: '2026-03-08T14:30:00Z' }],
        submittedAt: '2026-03-08T14:30:00Z', status: 'graded', grade: 88, feedback: 'Good implementation! Missing edge case for duplicate insertions.',
        rubricScores: { r1: 35, r2: 22, r3: 18, r4: 13 },
        isLate: false, plagiarismScore: 12,
        aiSummary: 'Well-structured BST implementation with all required operations. Includes comprehensive test cases.',
    },
    {
        id: 's4', assignmentId: 'a3', studentId: 'u2', studentName: 'Sarah Johnson', studentAvatar: '',
        files: [{ id: 'f3', name: 'todo-api.zip', size: 890000, type: 'application/zip', url: '#', uploadedAt: '2026-03-07T20:00:00Z' }],
        submittedAt: '2026-03-07T20:00:00Z', status: 'graded', grade: 140, feedback: 'Excellent work! API is well-structured with proper error handling. Minor issue with input validation.',
        rubricScores: { r5: 48, r6: 28, r7: 30, r8: 34 },
        isLate: false, plagiarismScore: 8,
        aiSummary: 'Complete REST API with all CRUD operations. Uses middleware for validation. Deployed successfully.',
    },
    {
        id: 's_u2_a5', assignmentId: 'a5', studentId: 'u2', studentName: 'Sarah Johnson', studentAvatar: '',
        files: [{ id: 'f_u2a5', name: 'linear_regression.ipynb', size: 156000, type: 'application/x-ipynb+json', url: '#', uploadedAt: '2026-03-11T10:00:00Z' }],
        submittedAt: '2026-03-11T10:00:00Z', status: 'graded', grade: 92,
        feedback: 'Excellent implementation with clear derivations. Gradient descent converges well.',
        isLate: false, plagiarismScore: 6,
    },
    {
        id: 's_u2_a6', assignmentId: 'a6', studentId: 'u2', studentName: 'Sarah Johnson', studentAvatar: '',
        files: [{ id: 'f_u2a6', name: 'hospital_ER.pdf', size: 340000, type: 'application/pdf', url: '#', uploadedAt: '2026-03-04T09:00:00Z' }],
        submittedAt: '2026-03-04T09:00:00Z', status: 'graded', grade: 45,
        feedback: 'Good diagram. One relationship is incorrectly modeled (N:M should be 1:N).',
        isLate: false, plagiarismScore: 3,
    },

    // Student u3 (Mike) submissions
    {
        id: 's2', assignmentId: 'a1', studentId: 'u3', studentName: 'Mike Chen', studentAvatar: '',
        files: [{ id: 'f2', name: 'mike_bst.zip', size: 198000, type: 'application/zip', url: '#', uploadedAt: '2026-03-11T02:15:00Z' }],
        submittedAt: '2026-03-11T02:15:00Z', status: 'late', isLate: true, plagiarismScore: 45,
        aiSummary: 'Basic BST implementation. Missing delete operation. Tests are minimal.',
    },
    {
        id: 's_u3_a3', assignmentId: 'a3', studentId: 'u3', studentName: 'Mike Chen', studentAvatar: '',
        files: [{ id: 'f_u3a3', name: 'rest_api_mike.zip', size: 450000, type: 'application/zip', url: '#', uploadedAt: '2026-03-09T16:00:00Z' }],
        submittedAt: '2026-03-09T16:00:00Z', status: 'graded', grade: 120,
        feedback: 'API works but lacks proper error handling. Missing input validation.',
        isLate: true,
    },

    // Student u4 (Emma) – missing assignment
    {
        id: 's3', assignmentId: 'a1', studentId: 'u4', studentName: 'Emma Williams', studentAvatar: '',
        files: [], submittedAt: null, status: 'missing', isLate: false,
    },

    // Student u7 (Alex)
    {
        id: 's5', assignmentId: 'a1', studentId: 'u7', studentName: 'Alex Turner', studentAvatar: '',
        files: [{ id: 'f4', name: 'alex_bst_solution.zip', size: 312000, type: 'application/zip', url: '#', uploadedAt: '2026-03-09T18:45:00Z' }],
        submittedAt: '2026-03-09T18:45:00Z', status: 'graded', grade: 92,
        feedback: 'Good implementation. Edge cases handled well.',
        isLate: false, plagiarismScore: 5,
        aiSummary: 'Clean BST implementation with good edge case handling. Well-documented code.',
    },

    // Student u8 (Priya)
    {
        id: 's6', assignmentId: 'a1', studentId: 'u8', studentName: 'Priya Patel', studentAvatar: '',
        files: [{ id: 'f5', name: 'priya_bst.zip', size: 278000, type: 'application/zip', url: '#', uploadedAt: '2026-03-10T23:50:00Z' }],
        submittedAt: '2026-03-10T23:50:00Z', status: 'submitted', isLate: false, plagiarismScore: 15,
        aiSummary: 'Complete implementation with balanced BST variant. Includes visualization.',
    },

    // u2 submitted for Graph Traversal
    {
        id: 's_u2_a2', assignmentId: 'a2', studentId: 'u2', studentName: 'Sarah Johnson', studentAvatar: '',
        files: [{ id: 'f_u2a2', name: 'graph_algos.zip', size: 300000, type: 'application/zip', url: '#', uploadedAt: '2026-03-14T08:00:00Z' }],
        submittedAt: '2026-03-14T08:00:00Z', status: 'submitted', isLate: false,
    },

    // u9 (James) submissions
    {
        id: 's_u9_a1', assignmentId: 'a1', studentId: 'u9', studentName: 'James Wilson', studentAvatar: '',
        files: [{ id: 'f_u9a1', name: 'james_bst.zip', size: 210000, type: 'application/zip', url: '#', uploadedAt: '2026-03-10T22:00:00Z' }],
        submittedAt: '2026-03-10T22:00:00Z', status: 'submitted', isLate: false, plagiarismScore: 10,
    },
    {
        id: 's_u9_a3', assignmentId: 'a3', studentId: 'u9', studentName: 'James Wilson', studentAvatar: '',
        files: [{ id: 'f_u9a3', name: 'james_api.zip', size: 560000, type: 'application/zip', url: '#', uploadedAt: '2026-03-08T10:00:00Z' }],
        submittedAt: '2026-03-08T10:00:00Z', status: 'graded', grade: 135,
        feedback: 'Very well done! Consider adding API rate limiting.', isLate: false,
    },

    // u10 (Lisa) submissions
    {
        id: 's_u10_a1', assignmentId: 'a1', studentId: 'u10', studentName: 'Lisa Anderson', studentAvatar: '',
        files: [{ id: 'f_u10a1', name: 'lisa_bst.zip', size: 190000, type: 'application/zip', url: '#', uploadedAt: '2026-03-10T15:00:00Z' }],
        submittedAt: '2026-03-10T15:00:00Z', status: 'graded', grade: 78,
        feedback: 'Search works but delete is buggy. Good tests though.',
        isLate: false, plagiarismScore: 20,
    },
];

// ---- Notifications (expanded) ----
export const mockNotifications: Notification[] = [
    { id: 'n1', userId: 'u2', type: 'deadline', title: 'Assignment Due Soon', message: 'Binary Search Tree implementation is due in 2 hours', classId: 'c1', assignmentId: 'a1', read: false, createdAt: '2026-03-10T21:59:00Z' },
    { id: 'n2', userId: 'u2', type: 'grade', title: 'Grade Posted', message: 'Your Build a REST API assignment has been graded: 140/150', classId: 'c2', assignmentId: 'a3', read: false, createdAt: '2026-03-09T10:00:00Z' },
    { id: 'n3', userId: 'u2', type: 'announcement', title: 'New Announcement', message: 'Dr. John Smith posted a new announcement in Data Structures & Algorithms', classId: 'c1', read: true, createdAt: '2026-03-08T14:00:00Z' },
    { id: 'n4', userId: 'u1', type: 'submission', title: 'New Submission', message: 'Sarah Johnson submitted Binary Search Tree assignment', classId: 'c1', assignmentId: 'a1', read: false, createdAt: '2026-03-08T14:30:00Z' },
    { id: 'n5', userId: 'u2', type: 'reminder', title: 'Reminder', message: 'Graph Traversal Algorithms is due on March 15', classId: 'c1', assignmentId: 'a2', read: true, createdAt: '2026-03-07T10:00:00Z' },
    { id: 'n6', userId: 'u2', type: 'grade', title: 'Grade Posted', message: 'Your BST assignment has been graded: 88/100', classId: 'c1', assignmentId: 'a1', read: false, createdAt: '2026-03-01T08:00:00Z' },
    { id: 'n7', userId: 'u2', type: 'grade', title: 'Grade Posted', message: 'Your Linear Regression assignment has been graded: 92/100', classId: 'c3', assignmentId: 'a5', read: true, createdAt: '2026-02-28T09:00:00Z' },
    { id: 'n8', userId: 'u2', type: 'deadline', title: 'Due Tomorrow', message: 'React Portfolio Project is due tomorrow', classId: 'c2', assignmentId: 'a4', read: false, createdAt: '2026-03-01T20:00:00Z' },
    { id: 'n9', userId: 'u1', type: 'submission', title: 'New Submission', message: 'Mike Chen submitted Binary Search Tree assignment (late)', classId: 'c1', assignmentId: 'a1', read: false, createdAt: '2026-03-11T02:15:00Z' },
    { id: 'n10', userId: 'u1', type: 'submission', title: 'New Submission', message: 'James Wilson submitted Binary Search Tree assignment', classId: 'c1', assignmentId: 'a1', read: false, createdAt: '2026-03-10T22:00:00Z' },
    { id: 'n11', userId: 'u2', type: 'system', title: 'Welcome Back', message: 'Welcome to the new semester! Check your enrolled classes.', read: true, createdAt: '2026-02-20T08:00:00Z' },
    { id: 'n12', userId: 'u2', type: 'comment', title: 'New Comment', message: 'Mike Chen commented on your discussion in Web Development', classId: 'c2', read: false, createdAt: '2026-03-01T15:00:00Z' },
];

// ---- Announcements ----
export const mockAnnouncements: Announcement[] = [
    {
        id: 'ann1', classId: 'c1', authorId: 'u1', authorName: 'Dr. John Smith', authorAvatar: '',
        content: 'Welcome to Data Structures & Algorithms! Please review the syllabus and come prepared for our first lecture on Monday.',
        attachments: [], readBy: ['u2', 'u3'],
        comments: [{ id: 'com1', authorId: 'u2', authorName: 'Sarah Johnson', authorAvatar: '', content: 'Looking forward to the class!', createdAt: '2026-02-26T12:00:00Z' }],
        createdAt: '2026-02-25T10:00:00Z',
    },
    {
        id: 'ann2', classId: 'c1', authorId: 'u1', authorName: 'Dr. John Smith', authorAvatar: '',
        content: 'Important: The deadline for BST assignment has been extended by 2 days. New deadline is March 10.',
        attachments: [], readBy: ['u2'], comments: [], createdAt: '2026-03-06T09:00:00Z',
    },
    {
        id: 'ann3', classId: 'c2', authorId: 'u1', authorName: 'Dr. John Smith', authorAvatar: '',
        content: 'Great work on the REST API project everyone! I\'ve posted grades and feedback. Check your submissions for details.',
        attachments: [], readBy: ['u2', 'u3', 'u9'],
        comments: [{ id: 'com2', authorId: 'u3', authorName: 'Mike Chen', authorAvatar: '', content: 'Thank you for the detailed feedback!', createdAt: '2026-03-09T15:00:00Z' }],
        createdAt: '2026-03-09T10:00:00Z',
    },
    {
        id: 'ann4', classId: 'c3', authorId: 'u6', authorName: 'Prof. Maria Garcia', authorAvatar: '',
        content: 'Office hours this week will be shifted to Thursday 3-5 PM instead of Wednesday. Please plan accordingly.',
        attachments: [], readBy: [], comments: [], createdAt: '2026-03-01T08:00:00Z',
    },
    {
        id: 'ann5', classId: 'c1', authorId: 'u1', authorName: 'Dr. John Smith', authorAvatar: '',
        content: 'Midterm review session will be held on March 20 in Room 301. Bring your notes and any questions about graphs and trees.',
        attachments: [], readBy: ['u2'], comments: [], createdAt: '2026-03-02T10:00:00Z',
    },
];

// Cover image gradient backgrounds
export const classCoverGradients: Record<string, string> = {
    c1: 'linear-gradient(135deg, #1967d2 0%, #174ea6 50%, #1a237e 100%)',
    c2: 'linear-gradient(135deg, #1e8e3e 0%, #137333 50%, #0d5626 100%)',
    c3: 'linear-gradient(135deg, #e8710a 0%, #c4601c 50%, #a14e1b 100%)',
    c4: 'linear-gradient(135deg, #a142f4 0%, #8430ce 50%, #6a1fb0 100%)',
    c5: 'linear-gradient(135deg, #d93025 0%, #b3261e 50%, #8c1d18 100%)',
};
