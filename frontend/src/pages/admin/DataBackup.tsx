// ============================================
// Data & Backup Management
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel,
    CircularProgress, Alert, Paper, IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import {
    Backup as BackupIcon, Download as DownloadIcon, Restore as RestoreIcon,
    CloudDone as SuccessIcon, Error as FailIcon, HourglassEmpty as ProgressIcon,
    Storage as StorageIcon, Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { backupRecords, BackupRecord } from '../../data/adminMockData';
import { format } from 'date-fns';

export default function DataBackup() {
    const [backups] = useState<BackupRecord[]>(backupRecords);
    const [backupRunning, setBackupRunning] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
    const [exportOptions, setExportOptions] = useState({ grades: true, submissions: true, users: true, courses: false, analytics: false });

    const statusChip = (status: string) => {
        const configs: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
            completed: { icon: <SuccessIcon sx={{ fontSize: 14 }} />, bg: '#e6f4ea', color: '#137333' },
            in_progress: { icon: <ProgressIcon sx={{ fontSize: 14 }} />, bg: '#e8f0fe', color: '#1967d2' },
            failed: { icon: <FailIcon sx={{ fontSize: 14 }} />, bg: '#fce8e6', color: '#c5221f' },
        };
        const c = configs[status] || configs.completed;
        return <Chip icon={c.icon as any} label={status.replace('_', ' ')} size="small"
            sx={{ height: 24, fontSize: '0.6875rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', '& .MuiChip-icon': { color: c.color } }} />;
    };

    const typeChip = (type: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            full: { bg: '#e8f0fe', color: '#1967d2' },
            incremental: { bg: '#f3e8fd', color: '#7627bb' },
            manual: { bg: '#fef7e0', color: '#9a6700' },
        };
        const c = colors[type] || colors.full;
        return <Chip label={type} size="small" sx={{ height: 20, fontSize: '0.5625rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize' }} />;
    };

    const handleManualBackup = () => {
        setBackupRunning(true);
        setTimeout(() => setBackupRunning(false), 3000);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[
                    { icon: <StorageIcon />, label: 'Total Backup Size', value: '9.2 GB', color: '#1967d2' },
                    { icon: <BackupIcon />, label: 'Total Backups', value: String(backups.length), color: '#1e8e3e' },
                    { icon: <ScheduleIcon />, label: 'Last Backup', value: 'Today 3:00 AM', color: '#a142f4' },
                    { icon: <SuccessIcon />, label: 'Success Rate', value: '83%', color: '#e8710a' },
                ].map((s) => (
                    <Card key={s.label} sx={{ flex: 1, border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                            <Box sx={{ color: s.color, mb: 0.5, '& svg': { fontSize: 20 } }}>{s.icon}</Box>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: s.color }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: '0.625rem', color: '#5f6368' }}>{s.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button variant="contained" startIcon={backupRunning ? <CircularProgress size={16} color="inherit" /> : <BackupIcon />}
                    onClick={handleManualBackup} disabled={backupRunning}
                    sx={{ textTransform: 'none', bgcolor: '#1967d2' }}>
                    {backupRunning ? 'Running Backup...' : 'Manual Backup'}
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setExportDialogOpen(true)}
                    sx={{ textTransform: 'none' }}>Export Data</Button>
            </Box>

            {backupRunning && (
                <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={18} />}>
                    Full backup in progress... This may take several minutes.
                </Alert>
            )}

            {/* Backup History */}
            <Typography sx={{ fontWeight: 500, mb: 1.5 }}>📦 Backup History</Typography>
            <Card>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Size</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Duration</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Created By</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {backups.map((bk) => (
                                <TableRow key={bk.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.8125rem' }}>{format(new Date(bk.createdAt), 'MMM d, yyyy')}</Typography>
                                        <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6' }}>{format(new Date(bk.createdAt), 'h:mm a')}</Typography>
                                    </TableCell>
                                    <TableCell>{typeChip(bk.type)}</TableCell>
                                    <TableCell>{statusChip(bk.status)}</TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{bk.size}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{bk.duration}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{bk.createdBy || 'Automated'}</Typography></TableCell>
                                    <TableCell>
                                        {bk.status === 'completed' && (
                                            <>
                                                <Tooltip title="Download"><IconButton size="small"><DownloadIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                <Tooltip title="Restore"><IconButton size="small" onClick={() => { setSelectedBackup(bk); setRestoreDialogOpen(true); }}>
                                                    <RestoreIcon sx={{ fontSize: 16, color: '#e8710a' }} />
                                                </IconButton></Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Export Data</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.875rem', color: '#5f6368', mb: 2 }}>Select data to export:</Typography>
                    {Object.entries(exportOptions).map(([key, val]) => (
                        <FormControlLabel key={key}
                            control={<Checkbox checked={val} onChange={(e) => setExportOptions({ ...exportOptions, [key]: e.target.checked })} />}
                            label={<Typography sx={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{key}</Typography>}
                            sx={{ display: 'block' }} />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setExportDialogOpen(false)} sx={{ bgcolor: '#1967d2' }}>
                        Export CSV
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Restore Dialog */}
            <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>⚠️ Restore Backup</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>This will restore the system to the selected backup point. Current data may be lost.</Alert>
                    {selectedBackup && (
                        <Typography sx={{ fontSize: '0.875rem' }}>
                            Restore point: <strong>{format(new Date(selectedBackup.createdAt), 'MMM d, yyyy h:mm a')}</strong> ({selectedBackup.size})
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => setRestoreDialogOpen(false)}>Confirm Restore</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
