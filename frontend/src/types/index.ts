// ============================================
// Google Classroom Clone - Type Definitions
// ============================================

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section: string;
  subject: string;
  room?: string;
  coverImage: string;
  colorTheme: string;
  code: string;
  createdBy: string;
  teacherName: string;
  teacherAvatar: string;
  studentCount: number;
  createdAt: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string | null;
  dueTime?: string;
  points: number | null;
  topic?: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'scheduled';
  allowLateSubmission: boolean;
  maxFileSize: number; // MB
  allowedFormats: string[];
  submissionCount: number;
  gradedCount: number;
  rubric?: RubricCriterion[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link' | 'image' | 'video';
  url: string;
  size?: number;
  mimeType?: string;
}

export type SubmissionStatus = 'submitted' | 'late' | 'missing' | 'returned' | 'graded' | 'draft';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  files: SubmissionFile[];
  textEntry?: string;
  submittedAt: string | null;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
  isLate: boolean;
  plagiarismScore?: number;
  aiSummary?: string;
  fileHash?: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  assignmentId: string;
  studentId: string;
  score: number;
  maxScore: number;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'deadline' | 'grade' | 'submission' | 'announcement' | 'reminder' | 'comment' | 'system';
  title: string;
  message: string;
  classId?: string;
  assignmentId?: string;
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  readBy?: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  submissionId?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalSubmissions: number;
  lateSubmissions: number;
  missingSubmissions: number;
  averageGrade: number;
  plagiarismFlags: number;
}
