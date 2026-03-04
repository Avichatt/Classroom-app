// ============================================
// Student Dashboard - Home Page
// ============================================
import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar, Chip, LinearProgress,
    IconButton, Divider, Grid,
} from '@mui/material';
import {
    Assignment as AssignmentIcon, Timer as TimerIcon, CheckCircle as CheckIcon,
    TrendingUp as TrendingUpIcon, NotificationsActive as BellIcon,
    ArrowForward as ArrowIcon, School as SchoolIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { format, differenceInHours, differenceInMinutes, isPast } from 'date-fns';

function CountdownTimer({ dueDate }: { dueDate: string }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const due = new Date(dueDate);
    if (isPast(due)) return <Typography sx={{ fontSize: '0.75rem', color: '#d93025', fontWeight: 500 }}>Past due</Typography>;

    const hrs = differenceInHours(due, now);
    const mins = differenceInMinutes(due, now) % 60;

    const color = hrs < 24 ? '#d93025' : hrs < 72 ? '#e8710a' : '#1e8e3e';
    const text = hrs >= 24 ? `${Math.floor(hrs / 24)}d ${hrs % 24}h left` : `${hrs}h ${mins}m left`;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon sx={{ fontSize: 14, color }} />
            <Typography sx={{ fontSize: '0.75rem', color, fontWeight: 500 }}>{text}</Typography>
        </Box>
    );
}

export default function StudentDashboardPage() {
    const navigate = useNavigate();
    const { classes, assignments, submissions, announcements } = useAppStore();
    const { user } = useAuthStore();

    const mySubs = submissions.filter((s) => s.studentId === user?.id);

    // Upcoming assignments (not submitted by this student, with due date in future)
    const upcoming = assignments
        .filter((a) => a.status === 'published' && a.dueDate && !isPast(new Date(a.dueDate)))
        .filter((a) => {
            const sub = mySubs.find((s) => s.assignmentId === a.id);
            return !sub || sub.status === 'missing';
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

    // Recently submitted
    const recentSubmitted = mySubs
        .filter((s) => s.submittedAt && s.status !== 'missing')
        .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
        .slice(0, 4);

    // Grade summary
    const gradedSubs = mySubs.filter((s) => s.status === 'graded' && s.grade !== undefined);
    const totalEarned = gradedSubs.reduce((sum, s) => sum + (s.grade || 0), 0);
    const totalMax = gradedSubs.reduce((sum, s) => {
        const a = assignments.find((x) => x.id === s.assignmentId);
        return sum + (a?.points || 0);
    }, 0);
    const overallPct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

    // Recent announcements (across all classes)
    const recentAnnouncements = announcements
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

    const statCards = [
        { label: 'Overall Grade', value: `${overallPct}%`, icon: <TrendingUpIcon />, color: overallPct >= 80 ? '#1e8e3e' : overallPct >= 60 ? '#e8710a' : '#d93025', bg: overallPct >= 80 ? '#e6f4ea' : overallPct >= 60 ? '#fef7e0' : '#fce8e6' },
        { label: 'Assignments Due', value: upcoming.length, icon: <AssignmentIcon />, color: '#1967d2', bg: '#e8f0fe' },
        { label: 'Submitted', value: mySubs.filter((s) => s.status !== 'missing').length, icon: <CheckIcon />, color: '#1e8e3e', bg: '#e6f4ea' },
        { label: 'Graded', value: gradedSubs.length, icon: <SchoolIcon />, color: '#a142f4', bg: '#f3e8fd' },
    ];

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Greeting */}
            <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124', mb: 0.5 }}>
                Welcome back, {user?.name?.split(' ')[0]}!
            </Typography>
            <Typography sx={{ color: '#5f6368', fontSize: '0.875rem', mb: 3 }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Typography>

            {/* Stat Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 4 }}>
                {statCards.map((s) => (
                    <Card key={s.label} sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: s.bg, mx: 'auto', mb: 1, width: 44, height: 44 }}>
                                <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                            </Avatar>
                            <Typography sx={{ fontSize: '1.75rem', fontWeight: 400, color: s.color }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>{s.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Upcoming Assignments */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124' }}>
                            📋 Upcoming Assignments
                        </Typography>
                        <Chip label="View all" size="small" onClick={() => navigate('/assignments')} sx={{ cursor: 'pointer', fontSize: '0.75rem' }} />
                    </Box>
                    {upcoming.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <CheckIcon sx={{ fontSize: 48, color: '#1e8e3e', mb: 1 }} />
                            <Typography sx={{ color: '#5f6368' }}>All caught up! No pending assignments.</Typography>
                        </Card>
                    ) : (
                        upcoming.map((a) => {
                            const cls = classes.find((c) => c.id === a.classId);
                            return (
                                <Card key={a.id} sx={{ mb: 1.5, cursor: 'pointer', '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' } }}
                                    onClick={() => navigate(`/class/${a.classId}/assignment/${a.id}`)}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: cls?.colorTheme || '#1967d2', width: 36, height: 36, mr: 2 }}>
                                                <AssignmentIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{a.title}</Typography>
                                                <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>{cls?.name} • {a.points} pts</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                {a.dueDate && <CountdownTimer dueDate={a.dueDate} />}
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368', mt: 0.25 }}>
                                                    {a.dueDate && format(new Date(a.dueDate), 'MMM d')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Box>

                {/* Recently Submitted */}
                <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>
                        ✅ Recently Submitted
                    </Typography>
                    {recentSubmitted.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 48, color: '#dadce0', mb: 1 }} />
                            <Typography sx={{ color: '#5f6368' }}>No submissions yet.</Typography>
                        </Card>
                    ) : (
                        recentSubmitted.map((s) => {
                            const a = assignments.find((x) => x.id === s.assignmentId);
                            const cls = a ? classes.find((c) => c.id === a.classId) : null;
                            return (
                                <Card key={s.id} sx={{ mb: 1.5, cursor: 'pointer', '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' } }}
                                    onClick={() => a && navigate(`/class/${a.classId}/assignment/${a.id}`)}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: cls?.colorTheme || '#5f6368', width: 36, height: 36, mr: 2 }}>
                                                {s.status === 'graded' ? <SchoolIcon sx={{ fontSize: 18 }} /> : <CheckIcon sx={{ fontSize: 18 }} />}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{a?.title}</Typography>
                                                <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                                    {cls?.name} • {s.submittedAt && format(new Date(s.submittedAt), 'MMM d')}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={s.status === 'graded' ? `${s.grade}/${a?.points}` : s.isLate ? 'Late' : 'Turned in'}
                                                size="small"
                                                sx={{
                                                    height: 22, fontSize: '0.6875rem',
                                                    bgcolor: s.status === 'graded' ? '#e8f0fe' : s.isLate ? '#fce8e6' : '#e6f4ea',
                                                    color: s.status === 'graded' ? '#1967d2' : s.isLate ? '#c5221f' : '#137333',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Box>
            </Box>

            {/* Grade Summary + Announcements */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
                {/* Grade Summary Cards */}
                <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>📊 Grade Summary</Typography>
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '3rem', fontWeight: 300, color: overallPct >= 80 ? '#1e8e3e' : overallPct >= 60 ? '#e8710a' : '#d93025' }}>
                                    {overallPct}%
                                </Typography>
                                <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                                    Overall Average ({gradedSubs.length} graded)
                                </Typography>
                                <LinearProgress
                                    variant="determinate" value={overallPct}
                                    sx={{
                                        mt: 1, height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                                        '& .MuiLinearProgress-bar': { bgcolor: overallPct >= 80 ? '#1e8e3e' : overallPct >= 60 ? '#e8710a' : '#d93025', borderRadius: 3 }
                                    }}
                                />
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            {gradedSubs.slice(0, 3).map((s) => {
                                const a = assignments.find((x) => x.id === s.assignmentId);
                                const pct = a?.points ? Math.round(((s.grade || 0) / a.points) * 100) : 0;
                                return (
                                    <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                                        <Typography sx={{ fontSize: '0.8125rem', flex: 1 }}>{a?.title}</Typography>
                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: pct >= 80 ? '#1e8e3e' : pct >= 60 ? '#e8710a' : '#d93025' }}>
                                            {s.grade}/{a?.points} ({pct}%)
                                        </Typography>
                                    </Box>
                                );
                            })}
                            {gradedSubs.length > 3 && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#1967d2', cursor: 'pointer', mt: 1, textAlign: 'center' }}
                                    onClick={() => navigate('/grades')}>
                                    View full gradebook →
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Announcements Feed */}
                <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>📢 Announcements</Typography>
                    {recentAnnouncements.map((ann) => {
                        const cls = classes.find((c) => c.id === ann.classId);
                        const isRead = ann.readBy?.includes(user?.id || '');
                        return (
                            <Card key={ann.id} sx={{ mb: 1.5, borderLeft: isRead ? 'none' : `3px solid ${cls?.colorTheme || '#1967d2'}` }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: cls?.colorTheme || '#5f6368', fontSize: '0.75rem', mr: 1 }}>
                                            {ann.authorName.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{ann.authorName}</Typography>
                                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>
                                                {cls?.name} • {format(new Date(ann.createdAt), 'MMM d')}
                                            </Typography>
                                        </Box>
                                        {!isRead && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1967d2' }} />}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.8125rem', color: '#3c4043', lineHeight: 1.5 }}>
                                        {ann.content.substring(0, 120)}{ann.content.length > 120 ? '...' : ''}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
