// ============================================
// Plagiarism Control Center
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, Select, MenuItem, FormControl,
    InputLabel, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Tooltip,
} from '@mui/material';
import {
    Shield as ShieldIcon, Warning as WarningIcon, Check as CheckIcon,
    Close as CloseIcon, Escalator as EscalateIcon, Visibility as ViewIcon,
    Email as EmailIcon, TrendingUp as EscalateActIcon,
} from '@mui/icons-material';
import { plagiarismCases, PlagiarismCase } from '../../data/adminMockData';
import { format } from 'date-fns';

export default function PlagiarismCenter() {
    const [cases, setCases] = useState<PlagiarismCase[]>(plagiarismCases);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCase, setSelectedCase] = useState<PlagiarismCase | null>(null);

    const filtered = statusFilter === 'all' ? cases : cases.filter((c) => c.status === statusFilter);

    const statusChip = (status: string) => {
        const configs: Record<string, { bg: string; color: string; label: string }> = {
            pending: { bg: '#fef7e0', color: '#9a6700', label: 'Pending Review' },
            confirmed: { bg: '#fce8e6', color: '#c5221f', label: 'Confirmed' },
            false_positive: { bg: '#e6f4ea', color: '#137333', label: 'False Positive' },
            escalated: { bg: '#f3e8fd', color: '#7627bb', label: 'Escalated' },
        };
        const c = configs[status] || configs.pending;
        return <Chip label={c.label} size="small" sx={{ height: 24, fontSize: '0.6875rem', bgcolor: c.bg, color: c.color, fontWeight: 500 }} />;
    };

    const scoreSeverity = (score: number) => {
        if (score >= 60) return { color: '#d93025', bg: '#fce8e6', label: 'Critical' };
        if (score >= 40) return { color: '#e8710a', bg: '#fef7e0', label: 'High' };
        return { color: '#ea8600', bg: '#fef7e0', label: 'Moderate' };
    };

    const handleUpdateStatus = (id: string, status: 'confirmed' | 'false_positive' | 'escalated') => {
        setCases(cases.map((c) => c.id === id ? { ...c, status, reviewedBy: 'Robert Brown' } : c));
        setSelectedCase(null);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Cases', value: cases.length, color: '#5f6368', icon: <ShieldIcon /> },
                    { label: 'Pending Review', value: cases.filter((c) => c.status === 'pending').length, color: '#e8710a', icon: <WarningIcon /> },
                    { label: 'Confirmed', value: cases.filter((c) => c.status === 'confirmed').length, color: '#d93025', icon: <CloseIcon /> },
                    { label: 'False Positives', value: cases.filter((c) => c.status === 'false_positive').length, color: '#1e8e3e', icon: <CheckIcon /> },
                    { label: 'Escalated', value: cases.filter((c) => c.status === 'escalated').length, color: '#7627bb', icon: <EscalateActIcon /> },
                ].map((s) => (
                    <Card key={s.label} sx={{ flex: 1, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ p: 1.5, textAlign: 'center' }}>
                            <Box sx={{ color: s.color, mb: 0.5, '& svg': { fontSize: 20 } }}>{s.icon}</Box>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: s.color }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: '0.5625rem', color: '#5f6368' }}>{s.label}</Typography>
                        </Box>
                    </Card>
                ))}
            </Box>

            {/* Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 500, flex: 1 }}>Flagged Submissions</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="false_positive">False Positive</MenuItem>
                        <MenuItem value="escalated">Escalated</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Assignment</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Class</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Similarity</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Compared With</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Detected</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((pc) => {
                                const sev = scoreSeverity(pc.similarityScore);
                                return (
                                    <TableRow key={pc.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' }, bgcolor: pc.status === 'pending' ? '#fffde7' : 'inherit' }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem' }}>{pc.studentName.charAt(0)}</Avatar>
                                                <Typography sx={{ fontSize: '0.8125rem' }}>{pc.studentName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{pc.assignmentTitle}</Typography></TableCell>
                                        <TableCell><Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{pc.className}</Typography></TableCell>
                                        <TableCell>
                                            <Chip label={`${pc.similarityScore}%`} size="small"
                                                sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: sev.bg, color: sev.color }} />
                                        </TableCell>
                                        <TableCell><Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>{pc.comparedWith}</Typography></TableCell>
                                        <TableCell>{statusChip(pc.status)}</TableCell>
                                        <TableCell><Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>{format(new Date(pc.detectedAt), 'MMM d, h:mm a')}</Typography></TableCell>
                                        <TableCell>
                                            <Tooltip title="Review"><IconButton size="small" onClick={() => setSelectedCase(pc)}><ViewIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                            <Tooltip title="Send Warning"><IconButton size="small"><EmailIcon sx={{ fontSize: 16, color: '#e8710a' }} /></IconButton></Tooltip>
                                            <Tooltip title="Escalate"><IconButton size="small"><EscalateActIcon sx={{ fontSize: 16, color: '#7627bb' }} /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedCase} onClose={() => setSelectedCase(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Review Plagiarism Case</DialogTitle>
                <DialogContent>
                    {selectedCase && (
                        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>Student: {selectedCase.studentName}</Typography>
                                <Chip label={`${selectedCase.similarityScore}% match`} size="small"
                                    sx={{ bgcolor: '#fce8e6', color: '#d93025', fontWeight: 600 }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>Assignment: {selectedCase.assignmentTitle}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>Compared with: {selectedCase.comparedWith}</Typography>
                            <TextField label="Review Notes" multiline rows={3} fullWidth size="small" placeholder="Add notes about this case..." />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
                    <Button onClick={() => selectedCase && handleUpdateStatus(selectedCase.id, 'false_positive')}
                        color="success" sx={{ textTransform: 'none' }}>Mark as False Positive</Button>
                    <Button onClick={() => selectedCase && handleUpdateStatus(selectedCase.id, 'confirmed')}
                        color="error" sx={{ textTransform: 'none' }}>Confirm Violation</Button>
                    <Button variant="contained" onClick={() => selectedCase && handleUpdateStatus(selectedCase.id, 'escalated')}
                        sx={{ textTransform: 'none', bgcolor: '#7627bb' }}>Escalate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
