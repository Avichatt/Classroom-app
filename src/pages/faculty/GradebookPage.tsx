// ============================================
// Faculty Gradebook - Spreadsheet-style view
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, Chip, TextField, Avatar,
    Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
    Download as DownloadIcon, ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

export default function FacultyGradebookPage() {
    const navigate = useNavigate();
    const { classes, assignments, submissions } = useAppStore();
    const { user } = useAuthStore();
    const [classFilter, setClassFilter] = useState('all');

    const myClasses = classes.filter((c) => c.createdBy === user?.id);
    const filteredClasses = classFilter === 'all' ? myClasses : myClasses.filter((c) => c.id === classFilter);

    // Get all students who have submissions
    const allStudents = useMemo(() => {
        const studentMap = new Map<string, { id: string; name: string }>();
        submissions.forEach((s) => {
            if (!studentMap.has(s.studentId)) {
                studentMap.set(s.studentId, { id: s.studentId, name: s.studentName });
            }
        });
        return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [submissions]);

    // Get assignments for selected classes
    const classAssignments = useMemo(() => {
        const classIds = filteredClasses.map((c) => c.id);
        return assignments
            .filter((a) => classIds.includes(a.classId) && a.status === 'published')
            .sort((a, b) => {
                if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                return 0;
            });
    }, [assignments, filteredClasses]);

    // Filter students to those who are in the relevant classes
    const relevantStudents = useMemo(() => {
        const assignmentIds = classAssignments.map((a) => a.id);
        return allStudents.filter((st) =>
            submissions.some((s) => s.studentId === st.id && assignmentIds.includes(s.assignmentId))
        );
    }, [allStudents, classAssignments, submissions]);

    const getGrade = (studentId: string, assignmentId: string) => {
        const sub = submissions.find((s) => s.studentId === studentId && s.assignmentId === assignmentId);
        return sub;
    };

    const getStudentAvg = (studentId: string) => {
        const studentSubs = submissions.filter((s) =>
            s.studentId === studentId && s.status === 'graded' && s.grade !== undefined &&
            classAssignments.some((a) => a.id === s.assignmentId)
        );
        if (studentSubs.length === 0) return null;
        const earned = studentSubs.reduce((sum, s) => sum + (s.grade || 0), 0);
        const max = studentSubs.reduce((sum, s) => {
            const a = classAssignments.find((x) => x.id === s.assignmentId);
            return sum + (a?.points || 0);
        }, 0);
        return max > 0 ? Math.round((earned / max) * 100) : 0;
    };

    const handleExportCSV = () => {
        const headers = ['Student', ...classAssignments.map((a) => a.title), 'Average'];
        const rows = relevantStudents.map((st) => {
            const grades = classAssignments.map((a) => {
                const sub = getGrade(st.id, a.id);
                if (sub?.grade !== undefined) return `${sub.grade}/${a.points}`;
                if (sub?.status === 'submitted' || sub?.status === 'late') return 'Submitted';
                return 'Missing';
            });
            const avg = getStudentAvg(st.id);
            return [st.name, ...grades, avg !== null ? `${avg}%` : 'N/A'];
        });
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gradebook_${classFilter === 'all' ? 'all_classes' : classFilter}.csv`;
        a.click();
    };

    const getCellColor = (pct: number) => {
        if (pct >= 90) return '#e6f4ea';
        if (pct >= 80) return '#e8f0fe';
        if (pct >= 70) return '#fef7e0';
        if (pct >= 60) return '#fef7e0';
        return '#fce8e6';
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><BackIcon /></IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124' }}>Gradebook</Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 180, mr: 1 }}>
                    <InputLabel>Class</InputLabel>
                    <Select value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value)}>
                        <MenuItem value="all">All classes</MenuItem>
                        {myClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}
                    sx={{ textTransform: 'none', fontSize: '0.8125rem' }}>
                    Export CSV
                </Button>
            </Box>

            {/* Spreadsheet Table */}
            <Card>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa', position: 'sticky', left: 0, zIndex: 3, minWidth: 160 }}>
                                    Student
                                </TableCell>
                                {classAssignments.map((a) => {
                                    const cls = classes.find((c) => c.id === a.classId);
                                    return (
                                        <TableCell key={a.id} align="center"
                                            sx={{ fontWeight: 600, fontSize: '0.6875rem', bgcolor: '#f8f9fa', minWidth: 100, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                                                    {a.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.5625rem', color: '#5f6368' }}>
                                                    {a.points} pts
                                                </Typography>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cls?.colorTheme || '#5f6368', mt: 0.25 }} />
                                            </Box>
                                        </TableCell>
                                    );
                                })}
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#e8f0fe', minWidth: 80 }}>
                                    Average
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {relevantStudents.map((st) => {
                                const avg = getStudentAvg(st.id);
                                return (
                                    <TableRow key={st.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: '#fff', zIndex: 1, borderRight: '1px solid #e0e0e0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.6875rem', bgcolor: '#1967d2' }}>
                                                    {st.name.charAt(0)}
                                                </Avatar>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{st.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        {classAssignments.map((a) => {
                                            const sub = getGrade(st.id, a.id);
                                            const pct = sub?.grade !== undefined && a.points ? (sub.grade / a.points) * 100 : null;
                                            return (
                                                <TableCell key={a.id} align="center"
                                                    sx={{
                                                        bgcolor: sub?.grade !== undefined ? getCellColor(pct!) : sub?.status === 'missing' ? '#fff5f5' : '#fff',
                                                        cursor: sub && sub.status !== 'missing' ? 'pointer' : 'default',
                                                        '&:hover': sub && sub.status !== 'missing' ? { opacity: 0.8 } : {},
                                                    }}
                                                    onClick={() => sub && sub.status !== 'missing' && navigate(`/class/${a.classId}/assignment/${a.id}/grade/${sub.id}`)}>
                                                    {sub?.grade !== undefined ? (
                                                        <Box>
                                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{sub.grade}</Typography>
                                                            <Typography sx={{ fontSize: '0.5625rem', color: '#5f6368' }}>{Math.round(pct!)}%</Typography>
                                                        </Box>
                                                    ) : sub?.status === 'submitted' || sub?.status === 'late' ? (
                                                        <Chip label={sub.isLate ? 'Late' : '✓'} size="small"
                                                            sx={{ height: 18, fontSize: '0.5625rem', bgcolor: sub.isLate ? '#fce8e6' : '#e6f4ea', color: sub.isLate ? '#c5221f' : '#137333' }} />
                                                    ) : (
                                                        <Typography sx={{ fontSize: '0.6875rem', color: '#dadce0' }}>—</Typography>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ bgcolor: '#f8fbff', borderLeft: '1px solid #e0e0e0' }}>
                                            {avg !== null ? (
                                                <Chip label={`${avg}%`} size="small"
                                                    sx={{ fontWeight: 600, fontSize: '0.6875rem', bgcolor: getCellColor(avg), color: avg >= 70 ? '#137333' : '#c5221f' }} />
                                            ) : (
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6' }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
