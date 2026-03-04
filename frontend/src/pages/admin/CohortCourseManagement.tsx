// ============================================
// Cohort & Course Management
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Paper, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Archive as ArchiveIcon,
    People as PeopleIcon, School as FacultyIcon, DateRange as DateIcon,
    MenuBook as CourseIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import { cohorts, adminUsers } from '../../data/adminMockData';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';

export default function CohortCourseManagement() {
    const [tabValue, setTabValue] = useState(0);
    const [createCohortOpen, setCreateCohortOpen] = useState(false);
    const { classes } = useAppStore();

    const statusChip = (status: string) => {
        const configs: Record<string, { bg: string; color: string }> = {
            active: { bg: '#e6f4ea', color: '#137333' },
            archived: { bg: '#f1f3f4', color: '#5f6368' },
            upcoming: { bg: '#e8f0fe', color: '#1967d2' },
        };
        const c = configs[status] || configs.active;
        return <Chip label={status} size="small" sx={{ height: 22, fontSize: '0.625rem', bgcolor: c.bg, color: c.color, textTransform: 'capitalize', fontWeight: 500 }} />;
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontSize: '0.875rem' } }}>
                <Tab label="Cohorts" />
                <Tab label="Courses" />
            </Tabs>

            {tabValue === 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>Cohort Management</Typography>
                        <Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ textTransform: 'none', bgcolor: '#1967d2' }}
                            onClick={() => setCreateCohortOpen(true)}>Create Cohort</Button>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        {cohorts.map((ch) => (
                            <Card key={ch.id}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>{ch.name}</Typography>
                                        {statusChip(ch.status)}
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PeopleIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                                            <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{ch.studentIds.length} Students</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <FacultyIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                                            <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{ch.facultyIds.length} Faculty</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CourseIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                                            <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>{ch.courseCount} Courses</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <DateIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                                {format(new Date(ch.startDate), 'MMM d')} – {format(new Date(ch.endDate), 'MMM d, yyyy')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mr: 0.5 }}>Faculty: </Typography>
                                        {ch.facultyIds.map((fid) => {
                                            const f = adminUsers.find((u) => u.id === fid);
                                            return f ? (
                                                <Chip key={fid} size="small" label={f.name} avatar={<Avatar sx={{ width: 18, height: 18, fontSize: '0.5rem' }}>{f.name.charAt(0)}</Avatar>}
                                                    sx={{ height: 22, fontSize: '0.625rem' }} />
                                            ) : null;
                                        })}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button size="small" startIcon={<EditIcon />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Edit</Button>
                                        <Button size="small" startIcon={<PeopleIcon />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Manage Students</Button>
                                        {ch.status !== 'archived' && (
                                            <Button size="small" startIcon={<ArchiveIcon />} sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#5f6368' }}>Archive</Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </>
            )}

            {tabValue === 1 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>Course Management</Typography>
                    </Box>
                    <Card>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Course Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Cohort</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Faculty</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Students</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {classes.map((cls) => (
                                        <TableRow key={cls.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cls.colorTheme }} />
                                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{cls.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{cls.section}</Typography></TableCell>
                                            <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{cls.teacherName}</Typography></TableCell>
                                            <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{cls.studentCount}</Typography></TableCell>
                                            <TableCell><Chip label="Active" size="small" sx={{ height: 22, fontSize: '0.625rem', bgcolor: '#e6f4ea', color: '#137333' }} /></TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit"><IconButton size="small"><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                <Tooltip title="Archive"><IconButton size="small"><ArchiveIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                <Tooltip title="Delete"><IconButton size="small"><DeleteIcon sx={{ fontSize: 16, color: '#d93025' }} /></IconButton></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}

            {/* Create Cohort Dialog */}
            <Dialog open={createCohortOpen} onClose={() => setCreateCohortOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Cohort</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField label="Cohort Name" fullWidth size="small" placeholder="e.g., Fall 2026 - Computer Science" />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                            <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                        </Box>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Assign Faculty</InputLabel>
                            <Select label="Assign Faculty" multiple defaultValue={[]}>
                                {adminUsers.filter((u) => u.role === 'faculty').map((f) => (
                                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateCohortOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => setCreateCohortOpen(false)} sx={{ bgcolor: '#1967d2' }}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
