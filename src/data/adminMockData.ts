// ============================================
// Admin Mock Data - Production SaaS LMS
// ============================================

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
    cohort: string;
    status: 'active' | 'suspended' | 'pending';
    lastLogin: string;
    createdAt: string;
    avatar?: string;
}

export interface Cohort {
    id: string;
    name: string;
    facultyIds: string[];
    studentIds: string[];
    startDate: string;
    endDate: string;
    status: 'active' | 'archived' | 'upcoming';
    courseCount: number;
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    userName: string;
    action: string;
    actionType: 'login' | 'assignment' | 'submission' | 'grade' | 'role_change' | 'suspension' | 'config' | 'export' | 'security';
    details: string;
    ipAddress: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
}

export interface PlagiarismCase {
    id: string;
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    className: string;
    similarityScore: number;
    comparedWith: string;
    status: 'pending' | 'confirmed' | 'false_positive' | 'escalated';
    detectedAt: string;
    reviewedBy?: string;
}

export interface ActivityFeedItem {
    id: string;
    type: 'registration' | 'course_created' | 'assignment_published' | 'plagiarism_alert' | 'csv_import' | 'backup' | 'suspension';
    message: string;
    timestamp: string;
    userId?: string;
    userName?: string;
}

export interface SystemHealth {
    apiResponseTime: number;
    dbLatency: number;
    storageUsed: number;
    storageTotal: number;
    errorRate: number;
    queueBacklog: number;
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
}

export interface BackupRecord {
    id: string;
    type: 'full' | 'incremental' | 'manual';
    status: 'completed' | 'in_progress' | 'failed';
    size: string;
    createdAt: string;
    duration: string;
    createdBy?: string;
}

export interface RiskAlert {
    id: string;
    type: 'failed_login' | 'suspicious_upload' | 'repeat_plagiarism' | 'bulk_download' | 'brute_force';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    userName?: string;
    ipAddress: string;
    timestamp: string;
    status: 'new' | 'investigating' | 'resolved' | 'dismissed';
}

export interface SystemConfig {
    allowedFormats: string[];
    maxUploadSizeMB: number;
    defaultLatePenalty: number;
    reminderTimingHours: number;
    llmSummaryEnabled: boolean;
    plagiarismThreshold: number;
    defaultLanguage: string;
    timezone: string;
    nightMode: boolean;
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
}

// ── Mock Users ──────────────────────────────
export const adminUsers: AdminUser[] = [
    { id: 'u1', name: 'Dr. John Smith', email: 'john.smith@university.edu', role: 'faculty', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-03-01T14:30:00Z', createdAt: '2024-08-15T10:00:00Z' },
    { id: 'u2', name: 'Sarah Johnson', email: 'sarah.j@university.edu', role: 'student', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-03-01T16:45:00Z', createdAt: '2025-01-10T09:00:00Z' },
    { id: 'u3', name: 'Mike Chen', email: 'mike.c@university.edu', role: 'student', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-03-01T10:20:00Z', createdAt: '2025-01-10T09:00:00Z' },
    { id: 'u4', name: 'Dr. Emily Davis', email: 'emily.d@university.edu', role: 'faculty', cohort: 'Spring 2026', status: 'active', lastLogin: '2026-02-28T08:15:00Z', createdAt: '2024-06-01T10:00:00Z' },
    { id: 'u5', name: 'Alex Turner', email: 'alex.t@university.edu', role: 'student', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-02-27T11:30:00Z', createdAt: '2025-01-12T09:00:00Z' },
    { id: 'u6', name: 'Lisa Anderson', email: 'lisa.a@university.edu', role: 'student', cohort: 'Fall 2025', status: 'suspended', lastLogin: '2026-02-20T09:00:00Z', createdAt: '2025-01-10T09:00:00Z' },
    { id: 'u7', name: 'James Wilson', email: 'james.w@university.edu', role: 'student', cohort: 'Spring 2026', status: 'active', lastLogin: '2026-03-01T17:00:00Z', createdAt: '2025-06-15T09:00:00Z' },
    { id: 'u8', name: 'Priya Patel', email: 'priya.p@university.edu', role: 'student', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-03-01T12:00:00Z', createdAt: '2025-01-10T09:00:00Z' },
    { id: 'u9', name: 'Emma Williams', email: 'emma.w@university.edu', role: 'student', cohort: 'Fall 2025', status: 'pending', lastLogin: '', createdAt: '2026-02-28T14:00:00Z' },
    { id: 'u10', name: 'Robert Brown', email: 'robert.b@university.edu', role: 'admin', cohort: 'N/A', status: 'active', lastLogin: '2026-03-01T18:00:00Z', createdAt: '2023-01-01T10:00:00Z' },
    { id: 'u11', name: 'Dr. Maria Garcia', email: 'maria.g@university.edu', role: 'faculty', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-02-28T16:00:00Z', createdAt: '2024-07-20T10:00:00Z' },
    { id: 'u12', name: 'Kevin Lee', email: 'kevin.l@university.edu', role: 'student', cohort: 'Spring 2026', status: 'active', lastLogin: '2026-03-01T09:30:00Z', createdAt: '2025-06-15T09:00:00Z' },
    { id: 'u13', name: 'Sophie Taylor', email: 'sophie.t@university.edu', role: 'student', cohort: 'Spring 2026', status: 'active', lastLogin: '2026-02-28T14:20:00Z', createdAt: '2025-06-16T09:00:00Z' },
    { id: 'u14', name: 'David Kim', email: 'david.k@university.edu', role: 'student', cohort: 'Fall 2025', status: 'active', lastLogin: '2026-03-01T11:00:00Z', createdAt: '2025-01-11T09:00:00Z' },
    { id: 'u15', name: 'Dr. Alan Turing', email: 'alan.t@university.edu', role: 'faculty', cohort: 'Spring 2026', status: 'active', lastLogin: '2026-02-27T10:00:00Z', createdAt: '2024-08-01T10:00:00Z' },
];

// ── Cohorts ──────────────────────────────────
export const cohorts: Cohort[] = [
    { id: 'ch1', name: 'Fall 2025 - Computer Science', facultyIds: ['u1', 'u11'], studentIds: ['u2', 'u3', 'u5', 'u6', 'u8', 'u14'], startDate: '2025-09-01', endDate: '2025-12-15', status: 'active', courseCount: 5 },
    { id: 'ch2', name: 'Spring 2026 - Computer Science', facultyIds: ['u4', 'u15'], studentIds: ['u7', 'u12', 'u13'], startDate: '2026-01-15', endDate: '2026-05-30', status: 'active', courseCount: 4 },
    { id: 'ch3', name: 'Summer 2026 - Bootcamp', facultyIds: ['u1'], studentIds: [], startDate: '2026-06-01', endDate: '2026-08-15', status: 'upcoming', courseCount: 2 },
    { id: 'ch4', name: 'Spring 2025 - Data Science', facultyIds: ['u11'], studentIds: ['u2', 'u3', 'u5'], startDate: '2025-01-15', endDate: '2025-05-30', status: 'archived', courseCount: 3 },
];

// ── Audit Logs ──────────────────────────────
export const auditLogs: AuditLogEntry[] = [
    { id: 'al1', userId: 'u2', userName: 'Sarah Johnson', action: 'Login', actionType: 'login', details: 'Successful login from Chrome/Windows', ipAddress: '192.168.1.45', timestamp: '2026-03-01T16:45:00Z', severity: 'info' },
    { id: 'al2', userId: 'u1', userName: 'Dr. John Smith', action: 'Assignment Created', actionType: 'assignment', details: 'Created "React Portfolio Project" in Web Development', ipAddress: '10.0.0.12', timestamp: '2026-03-01T14:30:00Z', severity: 'info' },
    { id: 'al3', userId: 'u3', userName: 'Mike Chen', action: 'Submission Upload', actionType: 'submission', details: 'Uploaded mike_bst.zip (2.3 MB) for Binary Search Tree assignment', ipAddress: '192.168.1.78', timestamp: '2026-03-01T10:20:00Z', severity: 'info' },
    { id: 'al4', userId: 'u1', userName: 'Dr. John Smith', action: 'Grade Edit', actionType: 'grade', details: 'Changed grade for Sarah Johnson from 85 to 88 on BST assignment', ipAddress: '10.0.0.12', timestamp: '2026-03-01T09:00:00Z', severity: 'warning' },
    { id: 'al5', userId: 'u10', userName: 'Robert Brown', action: 'User Suspended', actionType: 'suspension', details: 'Suspended Lisa Anderson for academic integrity violation', ipAddress: '10.0.0.1', timestamp: '2026-02-28T16:30:00Z', severity: 'critical' },
    { id: 'al6', userId: 'u10', userName: 'Robert Brown', action: 'Role Changed', actionType: 'role_change', details: 'Changed Dr. Emily Davis role from TA to Faculty', ipAddress: '10.0.0.1', timestamp: '2026-02-28T15:00:00Z', severity: 'warning' },
    { id: 'al7', userId: 'u6', userName: 'Lisa Anderson', action: 'Failed Login', actionType: 'login', details: 'Failed login attempt (3rd attempt) - account locked', ipAddress: '203.45.67.89', timestamp: '2026-02-28T14:00:00Z', severity: 'critical' },
    { id: 'al8', userId: 'u10', userName: 'Robert Brown', action: 'System Config Change', actionType: 'config', details: 'Updated plagiarism threshold from 25% to 30%', ipAddress: '10.0.0.1', timestamp: '2026-02-27T11:00:00Z', severity: 'warning' },
    { id: 'al9', userId: 'u10', userName: 'Robert Brown', action: 'Data Export', actionType: 'export', details: 'Exported all grades for Fall 2025 cohort (CSV)', ipAddress: '10.0.0.1', timestamp: '2026-02-26T10:00:00Z', severity: 'info' },
    { id: 'al10', userId: 'u5', userName: 'Alex Turner', action: 'Login', actionType: 'login', details: 'Login from new device - iPhone 15 Safari', ipAddress: '172.16.0.55', timestamp: '2026-02-27T11:30:00Z', severity: 'warning' },
    { id: 'al11', userId: 'u4', userName: 'Dr. Emily Davis', action: 'Assignment Published', actionType: 'assignment', details: 'Published "ML Pipeline Project" in Machine Learning', ipAddress: '10.0.0.15', timestamp: '2026-02-25T09:00:00Z', severity: 'info' },
    { id: 'al12', userId: 'u7', userName: 'James Wilson', action: 'Submission Upload', actionType: 'submission', details: 'Uploaded james_rest_api.zip (4.1 MB) - exceeded recommended size', ipAddress: '192.168.2.30', timestamp: '2026-02-24T22:55:00Z', severity: 'warning' },
    { id: 'al13', userId: 'u10', userName: 'Robert Brown', action: 'Bulk Import', actionType: 'config', details: 'Imported 45 students via CSV for Spring 2026 cohort', ipAddress: '10.0.0.1', timestamp: '2026-02-23T10:00:00Z', severity: 'info' },
    { id: 'al14', userId: 'u3', userName: 'Mike Chen', action: 'Password Reset', actionType: 'security', details: 'Password reset requested via email', ipAddress: '192.168.1.78', timestamp: '2026-02-22T16:00:00Z', severity: 'info' },
    { id: 'al15', userId: 'u8', userName: 'Priya Patel', action: 'Submission Upload', actionType: 'submission', details: 'Re-submitted priya_bst_v2.zip (1.8 MB) for BST assignment', ipAddress: '192.168.1.92', timestamp: '2026-02-22T08:30:00Z', severity: 'info' },
];

// ── Plagiarism Cases ────────────────────────
export const plagiarismCases: PlagiarismCase[] = [
    { id: 'pc1', submissionId: 's-mc1', studentName: 'Mike Chen', assignmentTitle: 'Implement Binary Search Tree', className: 'Data Structures & Algorithms', similarityScore: 45, comparedWith: 'Lisa Anderson (s-la1)', status: 'pending', detectedAt: '2026-03-01T11:00:00Z' },
    { id: 'pc2', submissionId: 's-la1', studentName: 'Lisa Anderson', assignmentTitle: 'Implement Binary Search Tree', className: 'Data Structures & Algorithms', similarityScore: 45, comparedWith: 'Mike Chen (s-mc1)', status: 'confirmed', detectedAt: '2026-03-01T11:00:00Z', reviewedBy: 'Robert Brown' },
    { id: 'pc3', submissionId: 's-at2', studentName: 'Alex Turner', assignmentTitle: 'Build a REST API', className: 'Web Development', similarityScore: 32, comparedWith: 'External source (GitHub)', status: 'false_positive', detectedAt: '2026-02-28T09:00:00Z', reviewedBy: 'Dr. John Smith' },
    { id: 'pc4', submissionId: 's-kl1', studentName: 'Kevin Lee', assignmentTitle: 'Linear Regression', className: 'Machine Learning', similarityScore: 67, comparedWith: 'Sophie Taylor (s-st1)', status: 'escalated', detectedAt: '2026-02-27T14:00:00Z', reviewedBy: 'Robert Brown' },
    { id: 'pc5', submissionId: 's-ew1', studentName: 'Emma Williams', assignmentTitle: 'ER Diagram Design', className: 'Database Systems', similarityScore: 38, comparedWith: 'David Kim (s-dk1)', status: 'pending', detectedAt: '2026-02-26T16:00:00Z' },
];

// ── Activity Feed ───────────────────────────
export const activityFeed: ActivityFeedItem[] = [
    { id: 'af1', type: 'registration', message: 'Emma Williams registered as a new student', timestamp: '2026-03-01T18:00:00Z', userName: 'Emma Williams' },
    { id: 'af2', type: 'plagiarism_alert', message: 'Plagiarism detected: Mike Chen & Lisa Anderson (45% similarity)', timestamp: '2026-03-01T11:00:00Z' },
    { id: 'af3', type: 'assignment_published', message: 'Dr. John Smith published "React Portfolio Project"', timestamp: '2026-03-01T14:30:00Z', userName: 'Dr. John Smith' },
    { id: 'af4', type: 'course_created', message: 'New course "Advanced Algorithms" created by Dr. Alan Turing', timestamp: '2026-02-28T10:00:00Z', userName: 'Dr. Alan Turing' },
    { id: 'af5', type: 'csv_import', message: 'Bulk import completed: 45 students added to Spring 2026', timestamp: '2026-02-23T10:00:00Z', userName: 'Robert Brown' },
    { id: 'af6', type: 'suspension', message: 'Lisa Anderson suspended for academic integrity violation', timestamp: '2026-02-28T16:30:00Z', userName: 'Robert Brown' },
    { id: 'af7', type: 'backup', message: 'Automated full backup completed (2.3 GB)', timestamp: '2026-03-01T03:00:00Z' },
    { id: 'af8', type: 'registration', message: 'Kevin Lee registered for Spring 2026 cohort', timestamp: '2026-02-20T09:00:00Z', userName: 'Kevin Lee' },
    { id: 'af9', type: 'plagiarism_alert', message: 'High similarity alert: Kevin Lee & Sophie Taylor (67%)', timestamp: '2026-02-27T14:00:00Z' },
    { id: 'af10', type: 'assignment_published', message: 'Dr. Emily Davis published "Neural Network Lab"', timestamp: '2026-02-25T09:00:00Z', userName: 'Dr. Emily Davis' },
];

// ── System Health ───────────────────────────
export const systemHealth: SystemHealth = {
    apiResponseTime: 142,
    dbLatency: 23,
    storageUsed: 45.7,
    storageTotal: 100,
    errorRate: 0.12,
    queueBacklog: 3,
    uptime: 99.97,
    cpuUsage: 34,
    memoryUsage: 62,
};

// ── Backup Records ──────────────────────────
export const backupRecords: BackupRecord[] = [
    { id: 'bk1', type: 'full', status: 'completed', size: '2.3 GB', createdAt: '2026-03-01T03:00:00Z', duration: '12m 34s' },
    { id: 'bk2', type: 'incremental', status: 'completed', size: '340 MB', createdAt: '2026-02-28T03:00:00Z', duration: '2m 15s' },
    { id: 'bk3', type: 'incremental', status: 'completed', size: '280 MB', createdAt: '2026-02-27T03:00:00Z', duration: '1m 58s' },
    { id: 'bk4', type: 'full', status: 'completed', size: '2.1 GB', createdAt: '2026-02-24T03:00:00Z', duration: '11m 22s' },
    { id: 'bk5', type: 'manual', status: 'completed', size: '2.2 GB', createdAt: '2026-02-20T15:30:00Z', duration: '12m 01s', createdBy: 'Robert Brown' },
    { id: 'bk6', type: 'incremental', status: 'failed', size: '0 MB', createdAt: '2026-02-19T03:00:00Z', duration: '0m 45s' },
];

// ── Risk Alerts ─────────────────────────────
export const riskAlerts: RiskAlert[] = [
    { id: 'ra1', type: 'failed_login', severity: 'high', description: '5 consecutive failed login attempts for lisa.a@university.edu', userId: 'u6', userName: 'Lisa Anderson', ipAddress: '203.45.67.89', timestamp: '2026-02-28T14:00:00Z', status: 'resolved' },
    { id: 'ra2', type: 'repeat_plagiarism', severity: 'critical', description: 'Kevin Lee flagged for plagiarism 3rd time this semester', userId: 'u12', userName: 'Kevin Lee', ipAddress: '192.168.2.44', timestamp: '2026-02-27T14:00:00Z', status: 'investigating' },
    { id: 'ra3', type: 'bulk_download', severity: 'medium', description: 'David Kim downloaded 47 files in 3 minutes from Course Materials', userId: 'u14', userName: 'David Kim', ipAddress: '192.168.1.101', timestamp: '2026-02-26T22:30:00Z', status: 'dismissed' },
    { id: 'ra4', type: 'suspicious_upload', severity: 'high', description: 'Executable file (.exe) detected in submission upload attempt', userId: 'u7', userName: 'James Wilson', ipAddress: '192.168.2.30', timestamp: '2026-02-25T11:00:00Z', status: 'resolved' },
    { id: 'ra5', type: 'brute_force', severity: 'critical', description: '150+ login attempts from single IP targeting multiple accounts', ipAddress: '45.33.32.156', timestamp: '2026-02-24T02:30:00Z', status: 'resolved' },
    { id: 'ra6', type: 'failed_login', severity: 'medium', description: '3 failed login attempts for mike.c@university.edu', userId: 'u3', userName: 'Mike Chen', ipAddress: '192.168.1.78', timestamp: '2026-03-01T08:00:00Z', status: 'new' },
];

// ── Default System Config ───────────────────
export const defaultSystemConfig: SystemConfig = {
    allowedFormats: ['.pdf', '.zip', '.py', '.java', '.js', '.ts', '.doc', '.docx', '.pptx'],
    maxUploadSizeMB: 50,
    defaultLatePenalty: 10,
    reminderTimingHours: 2,
    llmSummaryEnabled: true,
    plagiarismThreshold: 30,
    defaultLanguage: 'English',
    timezone: 'America/New_York',
    nightMode: false,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
};

// ── Chart Data Helpers ──────────────────────
export const submissionTrends = [
    { date: 'Feb 20', count: 12 },
    { date: 'Feb 21', count: 18 },
    { date: 'Feb 22', count: 8 },
    { date: 'Feb 23', count: 25 },
    { date: 'Feb 24', count: 30 },
    { date: 'Feb 25', count: 15 },
    { date: 'Feb 26', count: 22 },
    { date: 'Feb 27', count: 28 },
    { date: 'Feb 28', count: 35 },
    { date: 'Mar 1', count: 42 },
];

export const peakSubmissionHours = [
    { hour: '6 AM', count: 2 }, { hour: '8 AM', count: 8 }, { hour: '10 AM', count: 15 },
    { hour: '12 PM', count: 12 }, { hour: '2 PM', count: 18 }, { hour: '4 PM', count: 22 },
    { hour: '6 PM', count: 28 }, { hour: '8 PM', count: 35 }, { hour: '10 PM', count: 42 },
    { hour: '12 AM', count: 25 }, { hour: '2 AM', count: 8 }, { hour: '4 AM', count: 3 },
];

export const gradingTimeByFaculty = [
    { name: 'Dr. John Smith', avgHours: 18 },
    { name: 'Dr. Emily Davis', avgHours: 24 },
    { name: 'Dr. Maria Garcia', avgHours: 12 },
    { name: 'Dr. Alan Turing', avgHours: 36 },
];

export const gradeDistribution = [
    { grade: 'A', count: 28 }, { grade: 'B', count: 35 }, { grade: 'C', count: 18 },
    { grade: 'D', count: 8 }, { grade: 'F', count: 4 },
];
