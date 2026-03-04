// ============================================
// Notifications Panel - Slide-out Drawer
// ============================================
import {
    Box, Typography, Drawer, IconButton, Chip, Avatar, Divider, Button,
} from '@mui/material';
import {
    Close as CloseIcon, DoneAll as DoneAllIcon, NotificationsOff as NoNotifIcon,
    Assignment as AssignmentIcon, Grade as GradeIcon, Campaign as AnnIcon,
    Schedule as ScheduleIcon, Comment as CommentIcon, Info as SystemIcon,
    Send as SubmissionIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    deadline: { icon: <ScheduleIcon sx={{ fontSize: 18 }} />, color: '#d93025', bg: '#fce8e6' },
    grade: { icon: <GradeIcon sx={{ fontSize: 18 }} />, color: '#1e8e3e', bg: '#e6f4ea' },
    submission: { icon: <SubmissionIcon sx={{ fontSize: 18 }} />, color: '#1967d2', bg: '#e8f0fe' },
    announcement: { icon: <AnnIcon sx={{ fontSize: 18 }} />, color: '#e8710a', bg: '#fef7e0' },
    reminder: { icon: <ScheduleIcon sx={{ fontSize: 18 }} />, color: '#a142f4', bg: '#f3e8fd' },
    comment: { icon: <CommentIcon sx={{ fontSize: 18 }} />, color: '#1967d2', bg: '#e8f0fe' },
    system: { icon: <SystemIcon sx={{ fontSize: 18 }} />, color: '#5f6368', bg: '#f1f3f4' },
};

export default function NotificationsPanel() {
    const navigate = useNavigate();
    const { notifications, notificationDrawerOpen, setNotificationDrawerOpen, markNotificationRead, markAllRead } = useAppStore();
    const { user } = useAuthStore();

    const myNotifs = notifications
        .filter((n) => n.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unread = myNotifs.filter((n) => !n.read);

    const handleClick = (n: typeof myNotifs[0]) => {
        markNotificationRead(n.id);
        setNotificationDrawerOpen(false);
        if (n.classId && n.assignmentId) {
            navigate(`/class/${n.classId}/assignment/${n.assignmentId}`);
        } else if (n.classId) {
            navigate(`/class/${n.classId}`);
        }
    };

    return (
        <Drawer anchor="right" open={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 380 }, bgcolor: '#fff' } }}>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography sx={{ flex: 1, fontWeight: 500, fontSize: '1.125rem' }}>Notifications</Typography>
                {unread.length > 0 && (
                    <Button size="small" startIcon={<DoneAllIcon />} onClick={markAllRead}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', mr: 1 }}>
                        Mark all read
                    </Button>
                )}
                <IconButton onClick={() => setNotificationDrawerOpen(false)} size="small"><CloseIcon /></IconButton>
            </Box>

            {/* Unread count */}
            {unread.length > 0 && (
                <Box sx={{ px: 2, py: 1, bgcolor: '#e8f0fe' }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#1967d2', fontWeight: 500 }}>
                        {unread.length} unread notification{unread.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            )}

            {/* Notification List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {myNotifs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NoNotifIcon sx={{ fontSize: 48, color: '#dadce0', mb: 1 }} />
                        <Typography sx={{ color: '#5f6368' }}>No notifications yet.</Typography>
                    </Box>
                ) : (
                    myNotifs.map((n) => {
                        const cfg = typeConfig[n.type] || typeConfig.system;
                        return (
                            <Box key={n.id}
                                onClick={() => handleClick(n)}
                                sx={{
                                    display: 'flex', gap: 1.5, px: 2, py: 1.5,
                                    cursor: 'pointer', borderBottom: '1px solid #f1f3f4',
                                    bgcolor: n.read ? 'transparent' : '#f8fbff',
                                    '&:hover': { bgcolor: '#f1f3f4' },
                                    transition: 'background-color 0.15s ease',
                                }}>
                                <Avatar sx={{ bgcolor: cfg.bg, width: 36, height: 36 }}>
                                    <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: n.read ? 400 : 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {n.title}
                                        </Typography>
                                        {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1967d2', flexShrink: 0 }} />}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#3c4043', lineHeight: 1.4, mt: 0.25 }}>
                                        {n.message}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6', mt: 0.5 }}>
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>
        </Drawer>
    );
}
