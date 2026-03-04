// ============================================
// User Management Module
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, InputAdornment, Button, Chip, Avatar,
    IconButton, Select, MenuItem, FormControl, InputLabel, Dialog,
    DialogTitle, DialogContent, DialogActions, Tabs, Tab, Switch,
    FormControlLabel, Paper, Divider, Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Block as SuspendIcon, Delete as DeleteIcon, LockReset as ResetIcon,
    Upload as UploadIcon, Download as DownloadIcon,
    CheckCircle as ActiveIcon, Cancel as SuspendedIcon, HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { adminUsers, AdminUser } from '../../data/adminMockData';
import { format, formatDistanceToNow } from 'date-fns';

export default function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>(adminUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);

    const filtered = useMemo(() => {
        let list = users;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }
        if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
        if (statusFilter !== 'all') list = list.filter((u) => u.status === statusFilter);
        return list;
    }, [users, search, roleFilter, statusFilter]);

    const statusChip = (status: string) => {
        const configs: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
            active: { icon: <ActiveIcon sx={{ fontSize: 14 }} />, bg: '#e6f4ea', color: '#137333' },
            suspended: { icon: <SuspendedIcon sx={{ fontSize: 14 }} />, bg: '#fce8e6', color: '#c5221f' },
            pending: { icon: <PendingIcon sx={{ fontSize: 14 }} />, bg: '#fef7e0', color: '#9a6700' },
        };
        const c = configs[status] || configs.active;
        return <Chip icon={c.icon as any} label={status} size="small" sx={{ height: 24, fontSize: '0.6875rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', '& .MuiChip-icon': { color: c.color } }} />;
    };

    const roleChip = (role: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            admin: { bg: '#fce8e6', color: '#c5221f' },
            faculty: { bg: '#e8f0fe', color: '#1967d2' },
            student: { bg: '#f3e8fd', color: '#7627bb' },
        };
        const c = colors[role] || colors.student;
        return <Chip label={role} size="small" sx={{ height: 22, fontSize: '0.625rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', fontWeight: 500 }} />;
    };

    const handleSuspend = (id: string) => {
        setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } as AdminUser : u));
    };
    const handleDelete = (id: string) => setUsers(users.filter((u) => u.id !== id));

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Role', 'Cohort', 'Status', 'Last Login'];
        const rows = filtered.map((u) => [u.name, u.email, u.role, u.cohort, u.status, u.lastLogin || 'Never']);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'users_export.csv';
        a.click();
    };

    const permissions = [
        { key: 'create_assignment', label: 'Can create assignments' },
        { key: 'grade', label: 'Can grade submissions' },
        { key: 'manage_users', label: 'Can manage users' },
        { key: 'view_analytics', label: 'Can view analytics' },
        { key: 'manage_cohorts', label: 'Can manage cohorts' },
        { key: 'system_config', label: 'Can modify system config' },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Sub-tabs */}
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontSize: '0.875rem' } }}>
                <Tab label="User List" />
                <Tab label="Bulk Import" />
                <Tab label="Roles & Permissions" />
            </Tabs>

            {tabValue === 0 && (
                <>
                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField size="small" placeholder="Search by name or email..." value={search}
                            onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 200, maxWidth: 350 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: '#5f6368' }} /></InputAdornment> }} />
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                            <InputLabel>Role</InputLabel>
                            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="faculty">Faculty</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="suspended">Suspended</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ flex: 1 }} />
                        <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{filtered.length} users</Typography>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none' }}>Export</Button>
                    </Box>

                    {/* Table */}
                    <Card>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Cohort</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Last Login</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((u) => (
                                        <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: u.role === 'admin' ? '#d93025' : u.role === 'faculty' ? '#1967d2' : '#a142f4' }}>
                                                        {u.name.charAt(0)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{u.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{u.email}</Typography></TableCell>
                                            <TableCell>{roleChip(u.role)}</TableCell>
                                            <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{u.cohort}</Typography></TableCell>
                                            <TableCell>{statusChip(u.status)}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                                    {u.lastLogin ? formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true }) : 'Never'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit"><IconButton size="small" onClick={() => setEditUser(u)}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                <Tooltip title="Reset Password"><IconButton size="small"><ResetIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                <Tooltip title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}>
                                                    <IconButton size="small" onClick={() => handleSuspend(u.id)}>
                                                        <SuspendIcon sx={{ fontSize: 16, color: u.status === 'suspended' ? '#1e8e3e' : '#e8710a' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(u.id)}><DeleteIcon sx={{ fontSize: 16, color: '#d93025' }} /></IconButton></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}

            {tabValue === 1 && (
                <Card sx={{ p: 4, maxWidth: 700 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.125rem', mb: 2 }}>📤 Bulk Import Users</Typography>
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', border: '2px dashed #dadce0', borderRadius: 2, mb: 3, bgcolor: '#fafafa' }}>
                        <UploadIcon sx={{ fontSize: 48, color: '#1967d2', mb: 1 }} />
                        <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Drop CSV file here</Typography>
                        <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem', mb: 2 }}>or click to browse</Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: 'none' }}>
                            Choose File <input type="file" hidden accept=".csv" />
                        </Button>
                    </Paper>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>CSV Format Requirements:</Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.75rem', mb: 2 }}>
                        name, email, role, cohort<br />
                        John Doe, john@uni.edu, student, Fall 2025<br />
                        Jane Smith, jane@uni.edu, faculty, Spring 2026
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Auto-assign Role</InputLabel>
                            <Select label="Auto-assign Role" defaultValue="student">
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="faculty">Faculty</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Auto-assign Cohort</InputLabel>
                            <Select label="Auto-assign Cohort" defaultValue="ch2">
                                <MenuItem value="ch1">Fall 2025 - CS</MenuItem>
                                <MenuItem value="ch2">Spring 2026 - CS</MenuItem>
                                <MenuItem value="ch3">Summer 2026 - Bootcamp</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Button variant="contained" disabled sx={{ textTransform: 'none', bgcolor: '#1967d2' }}>
                        Preview & Import
                    </Button>
                </Card>
            )}

            {tabValue === 2 && (
                <Card sx={{ p: 3, maxWidth: 800 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '1.125rem', mb: 3 }}>🔐 Role & Permission Control</Typography>
                    {['admin', 'faculty', 'student'].map((role) => (
                        <Paper key={role} variant="outlined" sx={{ p: 2.5, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                {roleChip(role)}
                                <Typography sx={{ ml: 1, fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                                    {role} Permissions
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                                {permissions.map((p) => (
                                    <FormControlLabel key={p.key}
                                        control={<Switch size="small" defaultChecked={role === 'admin' || (role === 'faculty' && ['create_assignment', 'grade', 'view_analytics'].includes(p.key))} />}
                                        label={<Typography sx={{ fontSize: '0.8125rem' }}>{p.label}</Typography>}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    ))}
                    <Button variant="contained" sx={{ textTransform: 'none', bgcolor: '#1967d2', mt: 1 }}>Save Permissions</Button>
                </Card>
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    {editUser && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Name" defaultValue={editUser.name} fullWidth size="small" />
                            <TextField label="Email" defaultValue={editUser.email} fullWidth size="small" />
                            <FormControl size="small" fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select defaultValue={editUser.role} label="Role">
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="faculty">Faculty</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Cohort" defaultValue={editUser.cohort} fullWidth size="small" />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button variant="contained" onClick={() => setEditUser(null)} sx={{ bgcolor: '#1967d2' }}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
