// ============================================
// Auth Store - Zustand
// ============================================
import { create } from 'zustand';
import { User, UserRole } from '../types';
import api, { setAuthToken } from '../services/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginAs: (role: UserRole) => Promise<void>;
    logout: () => void;
    signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                setAuthToken(token);
                set({ isLoading: true });
                const res: any = await api.get('/auth/me');
                if (res.success && res.data) {
                    set({
                        user: { ...res.data, role: res.data.role.toLowerCase() },
                        isAuthenticated: true,
                        isLoading: false
                    });
                } else {
                    throw new Error('Invalid user');
                }
            }
        } catch (err) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            setAuthToken(null);
        }
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const res: any = await api.post('/auth/login', { email, password });
            if (res.success && res.data) {
                setAuthToken(res.data.accessToken);
                localStorage.setItem('refresh_token', res.data.refreshToken);
                set({
                    user: { ...res.data.user, role: res.data.user.role.toLowerCase() },
                    isAuthenticated: true,
                    isLoading: false
                });
                return true;
            }
            throw new Error('Login failed');
        } catch (err) {
            set({ isLoading: false });
            return false;
        }
    },

    loginAs: async (role: UserRole) => {
        const emails = {
            student: 'student@school.edu',
            faculty: 'faculty@school.edu',
            admin: 'admin@school.edu'
        };
        await useAuthStore.getState().login(emails[role], 'password123'); // Map to DB seed
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { } // Ignore errors
        set({ user: null, isAuthenticated: false });
        setAuthToken(null);
        window.location.href = '/login';
    },

    signup: async (name: string, email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        try {
            const res: any = await api.post('/auth/signup', { name, email, password, role });
            if (res.success && res.data) {
                setAuthToken(res.data.accessToken);
                localStorage.setItem('refresh_token', res.data.refreshToken);
                set({
                    user: { ...res.data.user, role: res.data.user.role.toLowerCase() },
                    isAuthenticated: true,
                    isLoading: false
                });
                return true;
            }
            throw new Error('Signup failed');
        } catch (err) {
            set({ isLoading: false });
            return false;
        }
    },
}));

// Initialize auth check immediately if token exists 
if (localStorage.getItem('access_token')) {
    useAuthStore.getState().checkAuth();
}
