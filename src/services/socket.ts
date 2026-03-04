import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001');

class SocketService {
    private socket: Socket | null = null;

    connect() {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to real-time notification server');
        });

        // Handle real-time notifications
        this.socket.on('notification:new', (notification) => {
            useAppStore.getState().addNotification(notification);
        });

        // Handle real-time grade updates
        this.socket.on('grade:updated', (data) => {
            // In a more complex app, we'd trigger a react-query invalidate.
            useAppStore.getState().updateSubmission(data.submissionId, data.gradeUpdates);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from real-time server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
