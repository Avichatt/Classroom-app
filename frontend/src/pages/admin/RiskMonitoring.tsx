// ============================================
// Risk & Abuse Monitoring
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Select, MenuItem,
    FormControl, InputLabel, IconButton, Tooltip, Button, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
    Warning as WarningIcon, Security as SecurityIcon, HighlightOff as CriticalIcon,
    Visibility as ViewIcon, CheckCircle as ResolveIcon, Block as BlockIcon,
    Shield as ShieldIcon, BugReport as BugIcon, CloudDownload as DownloadIcon,
    Upload as UploadIcon, VpnKey as LoginIcon, Repeat as RepeatIcon,
} from '@mui/icons-material';
import { riskAlerts, RiskAlert } from '../../data/adminMockData';
import { format, formatDistanceToNow } from 'date-fns';

export default function RiskMonitoring() {
    const [alerts, setAlerts] = useState<RiskAlert[]>(riskAlerts);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);

    const filtered = alerts.filter((a) =>
        (severityFilter === 'all' || a.severity === severityFilter) &&
        (statusFilter === 'all' || a.status === statusFilter)
    );

    const typeIcons: Record<string, React.ReactNode> = {
        failed_login: <LoginIcon sx={{ fontSize: 16 }} />,
        suspicious_upload: <UploadIcon sx={{ fontSize: 16 }} />,
        repeat_plagiarism: <RepeatIcon sx={{ fontSize: 16 }} />,
        bulk_download: <DownloadIcon sx={{ fontSize: 16 }} />,
        brute_force: <BugIcon sx={{ fontSize: 16 }} />,
    };

    const severityChip = (sev: string) => {
        const configs: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
            low: { bg: '#e6f4ea', color: '#137333', icon: <ShieldIcon sx={{ fontSize: 12 }} /> },
            medium: { bg: '#fef7e0', color: '#9a6700', icon: <WarningIcon sx={{ fontSize: 12 }} /> },
            high: { bg: '#fce8e6', color: '#c5221f', icon: <WarningIcon sx={{ fontSize: 12 }} /> },
            critical: { bg: '#d93025', color: '#fff', icon: <CriticalIcon sx={{ fontSize: 12 }} /> },
        };
        const c = configs[sev] || configs.medium;
        return <Chip icon={c.icon as any} label={sev} size="small"
            sx={{ height: 22, fontSize: '0.625rem', bgcolor: c.bg, color: c.color, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', '& .MuiChip-icon': { color: c.color } }} />;
    };

    const statusChip = (status: string) => {
        const configs: Record<string, { bg: string; color: string }> = {
            new: { bg: '#fce8e6', color: '#c5221f' },
            investigating: { bg: '#fef7e0', color: '#9a6700' },
            resolved: { bg: '#e6f4ea', color: '#137333' },
            dismissed: { bg: '#f1f3f4', color: '#5f6368' },
        };
        const c = configs[status] || configs.new;
        return <Chip label={status.replace('_', ' ')} size="small" sx={{ height: 22, fontSize: '0.625rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', fontWeight: 500 }} />;
    };

    const handleUpdateStatus = (id: string, status: 'investigating' | 'resolved' | 'dismissed') => {
        setAlerts(alerts.map((a) => a.id === id ? { ...a, status } : a));
        setSelectedAlert(null);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Alerts', value: alerts.length, color: '#5f6368', icon: <SecurityIcon /> },
                    { label: 'Critical', value: alerts.filter((a) => a.severity === 'critical').length, color: '#d93025', icon: <CriticalIcon /> },
                    { label: 'New', value: alerts.filter((a) => a.status === 'new').length, color: '#e8710a', icon: <WarningIcon /> },
                    { label: 'Investigating', value: alerts.filter((a) => a.status === 'investigating').length, color: '#1967d2', icon: <ShieldIcon /> },
                    { label: 'Resolved', value: alerts.filter((a) => a.status === 'resolved').length, color: '#1e8e3e', icon: <ResolveIcon /> },
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

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 500, flex: 1 }}>🛑 Risk Alerts</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Severity</InputLabel>
                    <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="investigating">Investigating</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="dismissed">Dismissed</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Severity</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((ra) => (
                                <TableRow key={ra.id} sx={{
                                    '&:hover': { bgcolor: '#f1f3f4' },
                                    borderLeft: ra.severity === 'critical' ? '3px solid #d93025' : ra.severity === 'high' ? '3px solid #e8710a' : '3px solid transparent',
                                    bgcolor: ra.status === 'new' ? '#fffde7' : 'inherit',
                                }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ color: '#5f6368', display: 'flex' }}>{typeIcons[ra.type]}</Box>
                                            <Typography sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{ra.type.replace(/_/g, ' ')}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{severityChip(ra.severity)}</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.8125rem', maxWidth: 300 }}>{ra.description}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {ra.userName ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem' }}>{ra.userName.charAt(0)}</Avatar>
                                                <Typography sx={{ fontSize: '0.75rem' }}>{ra.userName}</Typography>
                                            </Box>
                                        ) : <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Unknown</Typography>}
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#5f6368' }}>{ra.ipAddress}</Typography></TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                            {formatDistanceToNow(new Date(ra.timestamp), { addSuffix: true })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{statusChip(ra.status)}</TableCell>
                                    <TableCell>
                                        <Tooltip title="View Details"><IconButton size="small" onClick={() => setSelectedAlert(ra)}><ViewIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                        {ra.status === 'new' && (
                                            <Tooltip title="Investigate"><IconButton size="small" onClick={() => handleUpdateStatus(ra.id, 'investigating')}><ShieldIcon sx={{ fontSize: 16, color: '#1967d2' }} /></IconButton></Tooltip>
                                        )}
                                        {(ra.status === 'new' || ra.status === 'investigating') && (
                                            <Tooltip title="Block IP"><IconButton size="small"><BlockIcon sx={{ fontSize: 16, color: '#d93025' }} /></IconButton></Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Risk Alert Details</DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {severityChip(selectedAlert.severity)}
                                {statusChip(selectedAlert.status)}
                            </Box>
                            <Typography sx={{ fontSize: '0.875rem' }}>{selectedAlert.description}</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>User: {selectedAlert.userName || 'Unknown'}</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>IP: {selectedAlert.ipAddress}</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>Type: {selectedAlert.type.replace(/_/g, ' ')}</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>Time: {format(new Date(selectedAlert.timestamp), 'MMM d, h:mm a')}</Typography>
                            </Box>
                            <TextField label="Investigation Notes" multiline rows={3} fullWidth size="small" />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
                    <Button onClick={() => selectedAlert && handleUpdateStatus(selectedAlert.id, 'dismissed')} sx={{ textTransform: 'none', color: '#5f6368' }}>Dismiss</Button>
                    <Button onClick={() => selectedAlert && handleUpdateStatus(selectedAlert.id, 'resolved')} color="success" sx={{ textTransform: 'none' }}>Mark Resolved</Button>
                    <Button variant="contained" color="error" sx={{ textTransform: 'none' }}>Block IP & Resolve</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
