// ============================================
// Admin Overview - Home Panel
// ============================================
import { Box, Typography, Card, CardContent, Avatar, Chip, LinearProgress } from '@mui/material';
import {
    People as StudentsIcon, School as FacultyIcon, MenuBook as CoursesIcon,
    Assignment as AssignmentsIcon, Upload as SubmissionsIcon, Schedule as LateIcon,
    Flag as PlagiarismIcon, CloudDone as UptimeIcon,
    PersonAdd as RegIcon, AddCircle as CreateIcon, Publish as PubIcon,
    Warning as AlertIcon, CloudUpload as ImportIcon, Backup as BackupIcon,
    Block as SuspendIcon, Speed as SpeedIcon, Storage as DbIcon,
    CloudQueue as StorageIcon, ErrorOutline as ErrorIcon, Mail as QueueIcon,
} from '@mui/icons-material';
import { systemHealth, activityFeed, adminUsers } from '../../data/adminMockData';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '../../store/appStore';

export default function AdminOverview() {
    const { assignments, submissions } = useAppStore();

    const totalStudents = adminUsers.filter((u) => u.role === 'student').length;
    const totalFaculty = adminUsers.filter((u) => u.role === 'faculty').length;
    const activeCourses = 9;
    const activeAssignments = assignments.filter((a) => a.status === 'published').length;
    const submissionsToday = 42;
    const lateRate = 14;
    const plagCount = 5;

    const metrics = [
        { label: 'Total Students', value: totalStudents, icon: <StudentsIcon />, color: '#1967d2', bg: '#e8f0fe' },
        { label: 'Total Faculty', value: totalFaculty, icon: <FacultyIcon />, color: '#1e8e3e', bg: '#e6f4ea' },
        { label: 'Active Courses', value: activeCourses, icon: <CoursesIcon />, color: '#a142f4', bg: '#f3e8fd' },
        { label: 'Active Assignments', value: activeAssignments, icon: <AssignmentsIcon />, color: '#e8710a', bg: '#fef7e0' },
        { label: 'Submissions Today', value: submissionsToday, icon: <SubmissionsIcon />, color: '#1967d2', bg: '#e8f0fe' },
        { label: 'Late Submission %', value: `${lateRate}%`, icon: <LateIcon />, color: '#ea8600', bg: '#fef7e0' },
        { label: 'Plagiarism Flags', value: plagCount, icon: <PlagiarismIcon />, color: '#d93025', bg: '#fce8e6' },
        { label: 'System Uptime', value: `${systemHealth.uptime}%`, icon: <UptimeIcon />, color: '#1e8e3e', bg: '#e6f4ea' },
    ];

    const feedIcons: Record<string, React.ReactNode> = {
        registration: <RegIcon sx={{ fontSize: 18 }} />,
        course_created: <CreateIcon sx={{ fontSize: 18 }} />,
        assignment_published: <PubIcon sx={{ fontSize: 18 }} />,
        plagiarism_alert: <AlertIcon sx={{ fontSize: 18 }} />,
        csv_import: <ImportIcon sx={{ fontSize: 18 }} />,
        backup: <BackupIcon sx={{ fontSize: 18 }} />,
        suspension: <SuspendIcon sx={{ fontSize: 18 }} />,
    };
    const feedColors: Record<string, string> = {
        registration: '#1967d2', course_created: '#1e8e3e', assignment_published: '#a142f4',
        plagiarism_alert: '#d93025', csv_import: '#e8710a', backup: '#5f6368', suspension: '#d93025',
    };

    const healthMetrics = [
        { label: 'API Response Time', value: `${systemHealth.apiResponseTime}ms`, pct: Math.min(systemHealth.apiResponseTime / 500 * 100, 100), color: systemHealth.apiResponseTime < 200 ? '#1e8e3e' : '#e8710a', icon: <SpeedIcon sx={{ fontSize: 16 }} /> },
        { label: 'DB Latency', value: `${systemHealth.dbLatency}ms`, pct: Math.min(systemHealth.dbLatency / 100 * 100, 100), color: systemHealth.dbLatency < 50 ? '#1e8e3e' : '#e8710a', icon: <DbIcon sx={{ fontSize: 16 }} /> },
        { label: 'Storage Usage', value: `${systemHealth.storageUsed} / ${systemHealth.storageTotal} GB`, pct: (systemHealth.storageUsed / systemHealth.storageTotal) * 100, color: systemHealth.storageUsed / systemHealth.storageTotal < 0.7 ? '#1967d2' : '#d93025', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
        { label: 'Error Rate', value: `${systemHealth.errorRate}%`, pct: systemHealth.errorRate * 10, color: systemHealth.errorRate < 1 ? '#1e8e3e' : '#d93025', icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
        { label: 'Queue Backlog', value: `${systemHealth.queueBacklog} items`, pct: Math.min(systemHealth.queueBacklog / 50 * 100, 100), color: systemHealth.queueBacklog < 10 ? '#1e8e3e' : '#e8710a', icon: <QueueIcon sx={{ fontSize: 16 }} /> },
        { label: 'CPU Usage', value: `${systemHealth.cpuUsage}%`, pct: systemHealth.cpuUsage, color: systemHealth.cpuUsage < 60 ? '#1e8e3e' : '#d93025', icon: <SpeedIcon sx={{ fontSize: 16 }} /> },
        { label: 'Memory Usage', value: `${systemHealth.memoryUsage}%`, pct: systemHealth.memoryUsage, color: systemHealth.memoryUsage < 75 ? '#1967d2' : '#d93025', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* System Metrics Cards */}
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2, color: '#202124' }}>System Metrics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)', md: 'repeat(8,1fr)' }, gap: 1.5, mb: 4 }}>
                {metrics.map((m) => (
                    <Card key={m.label} sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: m.bg, mx: 'auto', mb: 0.5, width: 32, height: 32 }}>
                                <Box sx={{ color: m.color, display: 'flex', '& svg': { fontSize: 16 } }}>{m.icon}</Box>
                            </Avatar>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: m.color }}>{m.value}</Typography>
                            <Typography sx={{ fontSize: '0.5625rem', color: '#5f6368', lineHeight: 1.2 }}>{m.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Activity Feed */}
                <Card>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📡 Activity Feed</Typography>
                        {activityFeed.map((item) => (
                            <Box key={item.id} sx={{ display: 'flex', gap: 1.5, py: 1.25, borderBottom: '1px solid #f1f3f4', '&:last-child': { borderBottom: 'none' } }}>
                                <Avatar sx={{ bgcolor: `${feedColors[item.type]}15`, width: 32, height: 32 }}>
                                    <Box sx={{ color: feedColors[item.type], display: 'flex' }}>{feedIcons[item.type]}</Box>
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '0.8125rem', color: '#202124' }}>{item.message}</Typography>
                                    <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6', mt: 0.25 }}>
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </Typography>
                                </Box>
                                {item.type === 'plagiarism_alert' && <Chip label="Alert" size="small" sx={{ height: 20, fontSize: '0.5625rem', bgcolor: '#fce8e6', color: '#c5221f' }} />}
                                {item.type === 'suspension' && <Chip label="Action" size="small" sx={{ height: 20, fontSize: '0.5625rem', bgcolor: '#fef7e0', color: '#9a6700' }} />}
                            </Box>
                        ))}
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '1rem', flex: 1 }}>🖥️ System Health</Typography>
                            <Chip label="All systems operational" size="small" sx={{ bgcolor: '#e6f4ea', color: '#137333', fontSize: '0.6875rem', fontWeight: 500 }} />
                        </Box>
                        {healthMetrics.map((h) => (
                            <Box key={h.label} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ color: h.color, display: 'flex' }}>{h.icon}</Box>
                                        <Typography sx={{ fontSize: '0.8125rem', color: '#3c4043' }}>{h.label}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: h.color }}>{h.value}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={h.pct}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f3f4', '& .MuiLinearProgress-bar': { bgcolor: h.color, borderRadius: 3 } }} />
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
