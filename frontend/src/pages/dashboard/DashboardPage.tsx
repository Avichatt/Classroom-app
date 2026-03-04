// ============================================
// Faculty Dashboard Page
// ============================================
import { useMemo } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar, LinearProgress,
    Select, MenuItem, FormControl, InputLabel, Divider, Chip,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
    People as PeopleIcon, CheckCircle as CheckIcon, Schedule as ClockIcon,
    ErrorOutline as MissingIcon, TrendingUp as TrendingIcon,
    Flag as FlagIcon, Assignment as AssignmentIcon, ArrowForward as ArrowIcon,
    Grading as GradingIcon, CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { format, isPast, differenceInHours } from 'date-fns';
import { useState } from 'react';

export default function FacultyDashboardPage() {
    const navigate = useNavigate();
    const { classes, assignments, submissions } = useAppStore();
    const { user } = useAuthStore();
    const [classFilter, setClassFilter] = useState('all');

    const myClasses = classes.filter((c) => c.createdBy === user?.id);
    const myClassIds = myClasses.map((c) => c.id);

    const filteredAssignments = useMemo(() => {
        let list = assignments.filter((a) => myClassIds.includes(a.classId));
        if (classFilter !== 'all') list = list.filter((a) => a.classId === classFilter);
        return list;
    }, [assignments, classFilter, myClassIds]);

    const allSubs = submissions.filter((s) =>
        filteredAssignments.some((a) => a.id === s.assignmentId)
    );

    const pendingGrading = allSubs.filter((s) => s.status === 'submitted' || s.status === 'late');
    const gradedSubs = allSubs.filter((s) => s.status === 'graded');
    const lateSubs = allSubs.filter((s) => s.isLate);
    const missingSubs = allSubs.filter((s) => s.status === 'missing');
    const plagiarismFlags = allSubs.filter((s) => (s.plagiarismScore || 0) > 30);
    const totalStudents = (classFilter === 'all' ? myClasses : myClasses.filter((c) => c.id === classFilter))
        .reduce((sum, c) => sum + c.studentCount, 0);

    // Upcoming due dates
    const upcomingDue = filteredAssignments
        .filter((a) => a.dueDate && !isPast(new Date(a.dueDate)))
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

    const stats = [
        { label: 'Total Students', value: totalStudents, icon: <PeopleIcon />, color: '#1967d2', bg: '#e8f0fe' },
        { label: 'Pending Review', value: pendingGrading.length, icon: <GradingIcon />, color: '#e8710a', bg: '#fef7e0' },
        { label: 'Graded', value: gradedSubs.length, icon: <CheckIcon />, color: '#1e8e3e', bg: '#e6f4ea' },
        { label: 'Late', value: lateSubs.length, icon: <ClockIcon />, color: '#ea8600', bg: '#fef7e0' },
        { label: 'Missing', value: missingSubs.length, icon: <MissingIcon />, color: '#d93025', bg: '#fce8e6' },
        { label: 'Plagiarism Flags', value: plagiarismFlags.length, icon: <FlagIcon />, color: '#a142f4', bg: '#f3e8fd' },
    ];

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124' }}>Faculty Dashboard</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Class</InputLabel>
                    <Select value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value)}>
                        <MenuItem value="all">All classes</MenuItem>
                        {myClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            {/* Stat Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' }, gap: 2, mb: 4 }}>
                {stats.map((s) => (
                    <Card key={s.label} sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: s.bg, mx: 'auto', mb: 0.5, width: 36, height: 36 }}>
                                <Box sx={{ color: s.color, display: 'flex', '& svg': { fontSize: 18 } }}>{s.icon}</Box>
                            </Avatar>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 400, color: s.color }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>{s.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 3 }}>
                {/* Pending submissions to grade */}
                <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>
                        📋 Pending Review ({pendingGrading.length})
                    </Typography>
                    {pendingGrading.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <CheckIcon sx={{ fontSize: 48, color: '#1e8e3e', mb: 1 }} />
                            <Typography sx={{ color: '#5f6368' }}>All submissions have been graded!</Typography>
                        </Card>
                    ) : (
                        <Card>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Assignment</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Submitted</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingGrading.map((s) => {
                                            const a = filteredAssignments.find((x) => x.id === s.assignmentId);
                                            return (
                                                <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' }, cursor: 'pointer' }}
                                                    onClick={() => a && navigate(`/class/${a.classId}/assignment/${a.id}/grade`)}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#1967d2' }}>
                                                                {s.studentName.charAt(0)}
                                                            </Avatar>
                                                            <Typography sx={{ fontSize: '0.8125rem' }}>{s.studentName}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: '0.8125rem' }}>{a?.title}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                                            {s.submittedAt && format(new Date(s.submittedAt), 'MMM d, h:mm a')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={s.isLate ? 'Late' : 'On time'} size="small"
                                                            sx={{ height: 20, fontSize: '0.625rem', bgcolor: s.isLate ? '#fce8e6' : '#e6f4ea', color: s.isLate ? '#c5221f' : '#137333' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label="Grade" size="small" clickable
                                                            sx={{ height: 24, fontSize: '0.6875rem', bgcolor: '#1967d2', color: '#fff', '&:hover': { bgcolor: '#174ea6' } }} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}

                    {/* Assignment Status Overview */}
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mt: 3, mb: 2 }}>
                        📊 Assignments Overview
                    </Typography>
                    {filteredAssignments.filter((a) => a.status === 'published').map((a) => {
                        const cls = classes.find((c) => c.id === a.classId);
                        const subs = allSubs.filter((s) => s.assignmentId === a.id);
                        const submitted = subs.filter((s) => s.status !== 'missing').length;
                        const graded = subs.filter((s) => s.status === 'graded').length;
                        const total = cls?.studentCount || 1;
                        const pct = Math.round((submitted / total) * 100);

                        return (
                            <Card key={a.id} sx={{ mb: 1.5, cursor: 'pointer', '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' } }}
                                onClick={() => navigate(`/class/${a.classId}/assignment/${a.id}/submissions`)}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Avatar sx={{ bgcolor: cls?.colorTheme || '#1967d2', width: 32, height: 32, mr: 1.5 }}>
                                            <AssignmentIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{a.title}</Typography>
                                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                                {cls?.name} • {a.dueDate ? `Due ${format(new Date(a.dueDate), 'MMM d')}` : 'No due date'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{submitted}/{total}</Typography>
                                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>{graded} graded</Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ ml: 1 }}><ArrowIcon sx={{ fontSize: 18 }} /></IconButton>
                                    </Box>
                                    <LinearProgress variant="determinate" value={pct}
                                        sx={{
                                            height: 4, borderRadius: 2, bgcolor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': { bgcolor: cls?.colorTheme || '#1967d2', borderRadius: 2 }
                                        }} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>

                {/* Right column */}
                <Box>
                    {/* Upcoming Due Dates */}
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>📅 Upcoming Due Dates</Typography>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            {upcomingDue.length === 0 ? (
                                <Typography sx={{ color: '#5f6368', textAlign: 'center', py: 2 }}>No upcoming due dates</Typography>
                            ) : upcomingDue.map((a) => {
                                const cls = classes.find((c) => c.id === a.classId);
                                const hrs = differenceInHours(new Date(a.dueDate!), new Date());
                                return (
                                    <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f3f4', '&:last-child': { borderBottom: 'none' } }}>
                                        <CalendarIcon sx={{ fontSize: 18, color: cls?.colorTheme || '#5f6368', mr: 1.5 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{a.title}</Typography>
                                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>{cls?.name}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ fontSize: '0.75rem', color: hrs < 48 ? '#d93025' : '#5f6368', fontWeight: hrs < 48 ? 500 : 400 }}>
                                                {format(new Date(a.dueDate!), 'MMM d')}
                                            </Typography>
                                            {hrs < 48 && <Typography sx={{ fontSize: '0.6875rem', color: '#d93025' }}>{hrs}h left</Typography>}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Class Analytics Summary */}
                    <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#202124', mb: 2 }}>📈 Class Analytics</Typography>
                    <Card>
                        <CardContent>
                            {myClasses.map((cls) => {
                                const clsAssignments = filteredAssignments.filter((a) => a.classId === cls.id && a.status === 'published');
                                const clsSubs = allSubs.filter((s) => clsAssignments.some((a) => a.id === s.assignmentId));
                                const gradedInClass = clsSubs.filter((s) => s.status === 'graded' && s.grade !== undefined);
                                const avgGrade = gradedInClass.length > 0
                                    ? Math.round(gradedInClass.reduce((sum, s) => {
                                        const a = clsAssignments.find((x) => x.id === s.assignmentId);
                                        return sum + ((s.grade || 0) / (a?.points || 1)) * 100;
                                    }, 0) / gradedInClass.length)
                                    : 0;
                                const submRate = cls.studentCount > 0 && clsAssignments.length > 0
                                    ? Math.round((clsSubs.filter((s) => s.status !== 'missing').length / (cls.studentCount * clsAssignments.length)) * 100)
                                    : 0;

                                if (classFilter !== 'all' && cls.id !== classFilter) return null;
                                return (
                                    <Box key={cls.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f1f3f4', '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cls.colorTheme, mr: 1 }} />
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{cls.name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 400, color: '#1967d2' }}>{cls.studentCount}</Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Students</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 400, color: avgGrade >= 80 ? '#1e8e3e' : '#e8710a' }}>{avgGrade}%</Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Avg Grade</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 400, color: '#a142f4' }}>{submRate}%</Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Sub. Rate</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
