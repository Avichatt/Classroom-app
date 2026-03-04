import { create } from 'zustand';
import { ClassRoom, Assignment, Submission, Notification, Announcement } from '../types';
import api from '../services/api';
import { useAuthStore } from './authStore';

interface AppState {
    isHydrating: boolean;
    hydrate: () => Promise<void>;

    classes: ClassRoom[];
    selectedClass: ClassRoom | null;
    setSelectedClass: (classRoom: ClassRoom | null) => void;
    addClass: (classRoom: Partial<ClassRoom>) => Promise<void>;

    assignments: Assignment[];
    selectedAssignment: Assignment | null;
    setSelectedAssignment: (assignment: Assignment | null) => void;
    addAssignment: (classId: string, assignment: Partial<Assignment>) => Promise<void>;
    updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
    getAssignmentsByClass: (classId: string) => Assignment[];

    submissions: Submission[];
    addSubmission: (assignmentId: string, payload: any) => Promise<void>;
    getSubmissionsByAssignment: (assignmentId: string) => Submission[];
    getSubmissionByStudent: (assignmentId: string, studentId: string) => Submission | undefined;
    updateSubmission: (submissionId: string, updates: Partial<Submission>) => Promise<void>;

    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markNotificationRead: (id: string) => void;
    markAllRead: () => void;

    announcements: Announcement[];
    addAnnouncement: (announcement: Announcement) => void;
    getAnnouncementsByClass: (classId: string) => Announcement[];
    markAnnouncementRead: (announcementId: string, userId: string) => void;

    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    notificationDrawerOpen: boolean;
    setNotificationDrawerOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    isHydrating: false,

    hydrate: async () => {
        set({ isHydrating: true });
        try {
            const user = useAuthStore.getState().user;
            if (!user) return set({ isHydrating: false });

            const [classesRes, assignmentsRes] = await Promise.all([
                api.get('/classes').catch(() => ({ data: [] })),
                user.role === 'student'
                    ? api.get('/assignments/my-assignments').catch(() => ({ data: [] }))
                    : api.get('/assignments/overview').catch(() => ({ data: { assignments: [] } }))
            ]);

            const classes = (classesRes as any).data || [];
            const assignments = user.role === 'student'
                ? (assignmentsRes as any).data
                : ((assignmentsRes as any).data?.assignments || []);

            set({ classes, assignments, isHydrating: false });
        } catch (err) {
            console.error('Failed to hydrate state', err);
            set({ isHydrating: false });
        }
    },

    classes: [],
    selectedClass: null,
    setSelectedClass: (classRoom) => set({ selectedClass: classRoom }),
    addClass: async (classData) => {
        const res: any = await api.post('/classes', classData);
        if (res.success) set((state) => ({ classes: [...state.classes, res.data] }));
    },

    assignments: [],
    selectedAssignment: null,
    setSelectedAssignment: (assignment) => set({ selectedAssignment: assignment }),
    addAssignment: async (classId, assignment) => {
        const res: any = await api.post(`/assignments/class/${classId}`, assignment);
        if (res.success) set((state) => ({ assignments: [...state.assignments, res.data] }));
    },
    updateAssignment: async (id, updates) => {
        const res: any = await api.put(`/assignments/${id}`, updates);
        if (res.success) {
            set((state) => ({
                assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...res.data } : a)),
            }));
        }
    },
    getAssignmentsByClass: (classId) => get().assignments.filter((a) => a.classId === classId),

    submissions: [],
    addSubmission: async (assignmentId, payload) => {
        const res: any = await api.post(`/submissions/assignment/${assignmentId}`, payload);
        if (res.success) {
            set((state) => ({ submissions: [...state.submissions, res.data] }));
        }
    },
    getSubmissionsByAssignment: (assignmentId) => get().submissions.filter((s) => s.assignmentId === assignmentId),
    getSubmissionByStudent: (assignmentId, studentId) =>
        get().submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId),
    updateSubmission: async (id, updates) => {
        // Assume grading endpoint for this MVP shim
        const res: any = await api.post(`/grades/submission/${id}`, updates);
        if (res.success) {
            set((state) => ({
                submissions: state.submissions.map((s) => (s.id === id ? { ...s, grade: res.data } : s)),
            }));
        }
    },

    notifications: [],
    unreadCount: 0,
    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        })),
    markNotificationRead: (id) =>
        set((state) => {
            const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
            return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length };
        }),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),

    announcements: [],
    addAnnouncement: (announcement) => set((state) => ({ announcements: [announcement, ...state.announcements] })),
    getAnnouncementsByClass: (classId) => get().announcements.filter((a) => a.classId === classId),
    markAnnouncementRead: (announcementId, userId) =>
        set((state) => ({
            announcements: state.announcements.map((a) =>
                a.id === announcementId ? { ...a, readBy: [...(a.readBy || []), userId] } : a
            ),
        })),

    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    notificationDrawerOpen: false,
    setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),
}));
