// ============================================
// Audit Logs
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, InputAdornment, Select, MenuItem,
    FormControl, InputLabel, Chip, Button, IconButton, Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon, Download as ExportIcon, FilterList as FilterIcon,
    Login as LoginIcon, Assignment as AssignmentIcon, Upload as SubmissionIcon,
    Grade as GradeIcon, SwapHoriz as RoleIcon, Block as SuspendIcon,
    Settings as ConfigIcon, FileDownload as DataExportIcon, Security as SecurityIcon,
} from '@mui/icons-material';
import { auditLogs } from '../../data/adminMockData';
import { format } from 'date-fns';

export default function AuditLogs() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filtered = useMemo(() => {
        let list = auditLogs;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((l) => l.userName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.ipAddress.includes(q));
        }
        if (actionFilter !== 'all') list = list.filter((l) => l.actionType === actionFilter);
        if (severityFilter !== 'all') list = list.filter((l) => l.severity === severityFilter);
        if (dateFrom) list = list.filter((l) => new Date(l.timestamp) >= new Date(dateFrom));
        if (dateTo) list = list.filter((l) => new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59'));
        return list;
    }, [search, actionFilter, severityFilter, dateFrom, dateTo]);

    const actionIcons: Record<string, React.ReactNode> = {
        login: <LoginIcon sx={{ fontSize: 14 }} />, assignment: <AssignmentIcon sx={{ fontSize: 14 }} />,
        submission: <SubmissionIcon sx={{ fontSize: 14 }} />, grade: <GradeIcon sx={{ fontSize: 14 }} />,
        role_change: <RoleIcon sx={{ fontSize: 14 }} />, suspension: <SuspendIcon sx={{ fontSize: 14 }} />,
        config: <ConfigIcon sx={{ fontSize: 14 }} />, export: <DataExportIcon sx={{ fontSize: 14 }} />,
        security: <SecurityIcon sx={{ fontSize: 14 }} />,
    };

    const severityChip = (sev: string) => {
        const configs: Record<string, { bg: string; color: string }> = {
            info: { bg: '#e8f0fe', color: '#1967d2' },
            warning: { bg: '#fef7e0', color: '#9a6700' },
            critical: { bg: '#fce8e6', color: '#c5221f' },
        };
        const c = configs[sev] || configs.info;
        return <Chip label={sev} size="small" sx={{ height: 20, fontSize: '0.5625rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', fontWeight: 500 }} />;
    };

    const handleExport = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'];
        const rows = filtered.map((l) => [format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss'), l.userName, l.action, `"${l.details}"`, l.ipAddress, l.severity]);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'audit_logs.csv';
        a.click();
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size="small" placeholder="Search user, action, IP..." value={search}
                    onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 250 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#5f6368' }} /></InputAdornment> }} />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Action Type</InputLabel>
                    <Select value={actionFilter} label="Action Type" onChange={(e) => setActionFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="login">Login</MenuItem>
                        <MenuItem value="assignment">Assignment</MenuItem>
                        <MenuItem value="submission">Submission</MenuItem>
                        <MenuItem value="grade">Grade</MenuItem>
                        <MenuItem value="role_change">Role Change</MenuItem>
                        <MenuItem value="suspension">Suspension</MenuItem>
                        <MenuItem value="config">Config</MenuItem>
                        <MenuItem value="export">Export</MenuItem>
                        <MenuItem value="security">Security</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>Severity</InputLabel>
                    <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                </FormControl>
                <TextField type="date" size="small" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }} sx={{ width: 145 }} />
                <TextField type="date" size="small" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }} sx={{ width: 145 }} />
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{filtered.length} entries</Typography>
                <Button size="small" startIcon={<ExportIcon />} onClick={handleExport} sx={{ textTransform: 'none' }}>Export CSV</Button>
            </Box>

            {/* Table */}
            <Card>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', bgcolor: '#f8f9fa' }}>Severity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((log) => (
                                <TableRow key={log.id} sx={{
                                    '&:hover': { bgcolor: '#f1f3f4' },
                                    bgcolor: log.severity === 'critical' ? '#fce8e610' : 'inherit',
                                    borderLeft: log.severity === 'critical' ? '3px solid #d93025' : log.severity === 'warning' ? '3px solid #e8710a' : '3px solid transparent',
                                }}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', whiteSpace: 'nowrap' }}>
                                            {format(new Date(log.timestamp), 'MMM d, yyyy')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6' }}>
                                            {format(new Date(log.timestamp), 'h:mm a')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{log.userName}</Typography></TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ color: '#5f6368', display: 'flex' }}>{actionIcons[log.actionType]}</Box>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{log.action}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.75rem', color: '#5f6368', maxWidth: 350 }}>{log.details}</Typography></TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#5f6368' }}>{log.ipAddress}</Typography>
                                    </TableCell>
                                    <TableCell>{severityChip(log.severity)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
