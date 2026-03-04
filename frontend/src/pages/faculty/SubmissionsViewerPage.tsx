// ============================================
// Submissions Viewer Page
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, Avatar, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, InputAdornment,
    IconButton, Button, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
    Search as SearchIcon, ArrowBack as BackIcon,
    Download as DownloadIcon, Grading as GradeIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';

export default function SubmissionsViewerPage() {
    const navigate = useNavigate();
    const { classId, assignmentId } = useParams();
    const { classes, assignments, submissions } = useAppStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const cls = classes.find((c) => c.id === classId);
    const assignment = assignments.find((a) => a.id === assignmentId);
    const subs = submissions.filter((s) => s.assignmentId === assignmentId);

    const filtered = useMemo(() => {
        let list = subs;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((s) => s.studentName.toLowerCase().includes(q));
        }
        if (statusFilter !== 'all') {
            list = list.filter((s) => s.status === statusFilter);
        }
        return list.sort((a, b) => {
            if (a.status === 'missing' && b.status !== 'missing') return 1;
            if (a.status !== 'missing' && b.status === 'missing') return -1;
            return a.studentName.localeCompare(b.studentName);
        });
    }, [subs, search, statusFilter]);

    const submitted = subs.filter((s) => s.status !== 'missing').length;
    const graded = subs.filter((s) => s.status === 'graded').length;

    const getStatusChip = (status: string, isLate: boolean) => {
        const configs: Record<string, { bg: string; color: string; label: string }> = {
            submitted: { bg: '#e6f4ea', color: '#137333', label: 'Submitted' },
            graded: { bg: '#e8f0fe', color: '#1967d2', label: 'Graded' },
            late: { bg: '#fce8e6', color: '#c5221f', label: 'Late' },
            missing: { bg: '#f1f3f4', color: '#5f6368', label: 'Missing' },
        };
        const key = isLate ? 'late' : status;
        const cfg = configs[key] || configs.submitted;
        return <Chip label={cfg.label} size="small" sx={{ height: 22, fontSize: '0.6875rem', bgcolor: cfg.bg, color: cfg.color, fontWeight: 500 }} />;
    };

    const handleExportCSV = () => {
        const headers = ['Student', 'Status', 'Submitted At', 'Grade', 'Late', 'Plagiarism Score'];
        const rows = subs.map((s) => [
            s.studentName,
            s.status,
            s.submittedAt ? format(new Date(s.submittedAt), 'yyyy-MM-dd HH:mm') : 'N/A',
            s.grade !== undefined ? `${s.grade}/${assignment?.points}` : 'N/A',
            s.isLate ? 'Yes' : 'No',
            s.plagiarismScore !== undefined ? `${s.plagiarismScore}%` : 'N/A',
        ]);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assignment?.title}_submissions.csv`;
        a.click();
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><BackIcon /></IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124' }}>Submissions</Typography>
                    <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                        {assignment?.title} • {cls?.name}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, mr: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: '#1967d2' }}>{submitted}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Submitted</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: '#1e8e3e' }}>{graded}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Graded</Typography>
                    </Box>
                </Box>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                    Export CSV
                </Button>
            </Box>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField size="small" placeholder="Search students..." value={search}
                    onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, maxWidth: 300 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: '#5f6368' }} /></InputAdornment> }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="submitted">Submitted</MenuItem>
                        <MenuItem value="graded">Graded</MenuItem>
                        <MenuItem value="late">Late</MenuItem>
                        <MenuItem value="missing">Missing</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Submitted</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Files</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Plagiarism</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((s) => (
                                <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8125rem', bgcolor: '#1967d2' }}>
                                                {s.studentName.charAt(0)}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.studentName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getStatusChip(s.status, s.isLate)}</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>
                                            {s.submittedAt ? format(new Date(s.submittedAt), 'MMM d, h:mm a') : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {s.files.length > 0 ? (
                                            s.files.map((f) => (
                                                <Chip key={f.id} label={f.name} size="small" variant="outlined"
                                                    sx={{ mr: 0.5, height: 22, fontSize: '0.6875rem' }} />
                                            ))
                                        ) : <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>No files</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        {s.grade !== undefined ? (
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1967d2' }}>
                                                {s.grade}/{assignment?.points}
                                            </Typography>
                                        ) : <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>—</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        {s.plagiarismScore !== undefined ? (
                                            <Chip label={`${s.plagiarismScore}%`} size="small"
                                                sx={{
                                                    height: 20, fontSize: '0.625rem', fontWeight: 500,
                                                    bgcolor: s.plagiarismScore > 30 ? '#fce8e6' : '#e6f4ea',
                                                    color: s.plagiarismScore > 30 ? '#c5221f' : '#137333',
                                                }} />
                                        ) : <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>—</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        {s.status !== 'missing' && (
                                            <Button size="small" variant={s.status === 'graded' ? 'outlined' : 'contained'}
                                                onClick={() => navigate(`/class/${classId}/assignment/${assignmentId}/grade/${s.id}`)}
                                                sx={{
                                                    textTransform: 'none', fontSize: '0.6875rem', minWidth: 60,
                                                    ...(s.status !== 'graded' && { bgcolor: '#1967d2' })
                                                }}>
                                                {s.status === 'graded' ? 'Edit' : 'Grade'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
