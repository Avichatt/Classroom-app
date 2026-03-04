// ============================================
// Assignment List Page - Filtering, Sorting, Search
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar, Chip, TextField,
    InputAdornment, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, IconButton,
} from '@mui/material';
import {
    Search as SearchIcon, Assignment as AssignmentIcon,
    FilterList as FilterIcon, Sort as SortIcon,
    CheckCircle as CheckIcon, Schedule as ScheduleIcon,
    Error as ErrorIcon, School as GradedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { format, isPast, differenceInHours } from 'date-fns';

type FilterType = 'all' | 'due-soon' | 'submitted' | 'graded' | 'late' | 'missing';

export default function AssignmentListPage() {
    const navigate = useNavigate();
    const { classes, assignments, submissions } = useAppStore();
    const { user } = useAuthStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'points'>('dueDate');
    const [classFilter, setClassFilter] = useState('all');

    const mySubs = submissions.filter((s) => s.studentId === user?.id);
    const isFaculty = user?.role === 'faculty';

    const filtered = useMemo(() => {
        let list = assignments.filter((a) => a.status === 'published');

        // Class filter
        if (classFilter !== 'all') list = list.filter((a) => a.classId === classFilter);

        // Faculty only sees their classes
        if (isFaculty) {
            const myClassIds = classes.filter((c) => c.createdBy === user?.id).map((c) => c.id);
            list = list.filter((a) => myClassIds.includes(a.classId));
        }

        // Search
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((a) =>
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                classes.find((c) => c.id === a.classId)?.name.toLowerCase().includes(q)
            );
        }

        // Filter by status
        if (!isFaculty) {
            switch (filter) {
                case 'due-soon':
                    list = list.filter((a) => a.dueDate && !isPast(new Date(a.dueDate)) && differenceInHours(new Date(a.dueDate), new Date()) <= 72);
                    break;
                case 'submitted':
                    list = list.filter((a) => {
                        const sub = mySubs.find((s) => s.assignmentId === a.id);
                        return sub && (sub.status === 'submitted' || sub.status === 'late');
                    });
                    break;
                case 'graded':
                    list = list.filter((a) => {
                        const sub = mySubs.find((s) => s.assignmentId === a.id);
                        return sub?.status === 'graded';
                    });
                    break;
                case 'late':
                    list = list.filter((a) => {
                        const sub = mySubs.find((s) => s.assignmentId === a.id);
                        return sub?.isLate || (a.dueDate && isPast(new Date(a.dueDate)) && (!sub || sub.status === 'missing'));
                    });
                    break;
                case 'missing':
                    list = list.filter((a) => {
                        const sub = mySubs.find((s) => s.assignmentId === a.id);
                        return !sub || sub.status === 'missing';
                    });
                    break;
            }
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return (b.points || 0) - (a.points || 0);
        });

        return list;
    }, [assignments, filter, search, sortBy, classFilter, mySubs, isFaculty, user, classes]);

    const filterTabs = [
        { value: 'all', label: 'All', count: assignments.filter((a) => a.status === 'published').length },
        { value: 'due-soon', label: 'Due Soon', icon: <ScheduleIcon sx={{ fontSize: 16 }} /> },
        { value: 'submitted', label: 'Submitted', icon: <CheckIcon sx={{ fontSize: 16 }} /> },
        { value: 'graded', label: 'Graded', icon: <GradedIcon sx={{ fontSize: 16 }} /> },
        { value: 'late', label: 'Late', icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
        { value: 'missing', label: 'Missing' },
    ];

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124', mb: 2 }}>Assignments</Typography>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small" placeholder="Search assignments..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#5f6368', fontSize: 20 }} /></InputAdornment>,
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Class</InputLabel>
                    <Select value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value)}>
                        <MenuItem value="all">All classes</MenuItem>
                        {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value as any)}>
                        <MenuItem value="dueDate">Due date</MenuItem>
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="points">Points</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Filter Tabs */}
            {!isFaculty && (
                <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="scrollable" scrollButtons="auto"
                    sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.8125rem' } }}>
                    {filterTabs.map((t) => (
                        <Tab key={t.value} value={t.value}
                            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{t.icon}{t.label}</Box>}
                        />
                    ))}
                </Tabs>
            )}

            {/* Results count */}
            <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem', mb: 2 }}>{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</Typography>

            {/* Assignment Cards */}
            {filtered.map((a) => {
                const cls = classes.find((c) => c.id === a.classId);
                const sub = mySubs.find((s) => s.assignmentId === a.id);
                const isDue = a.dueDate && isPast(new Date(a.dueDate));
                const dueSoon = a.dueDate && !isDue && differenceInHours(new Date(a.dueDate), new Date()) <= 48;

                return (
                    <Card key={a.id} sx={{
                        mb: 1.5, cursor: 'pointer', transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 1px 6px rgba(60,64,67,.2)' },
                        borderLeft: `4px solid ${cls?.colorTheme || '#1967d2'}`,
                    }}
                        onClick={() => navigate(`/class/${a.classId}/assignment/${a.id}`)}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: cls?.colorTheme || '#1967d2', width: 40, height: 40, mr: 2 }}>
                                    <AssignmentIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>{a.title}</Typography>
                                        {dueSoon && <Chip label="Due soon" size="small" sx={{ height: 20, fontSize: '0.625rem', bgcolor: '#fef7e0', color: '#9a6700' }} />}
                                    </Box>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem', mt: 0.25 }}>
                                        {cls?.name} {a.topic ? `• ${a.topic}` : ''}
                                    </Typography>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.75rem', mt: 0.5 }}>
                                        {a.description.substring(0, 100)}{a.description.length > 100 ? '...' : ''}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', ml: 2, flexShrink: 0 }}>
                                    {a.dueDate && (
                                        <Typography sx={{ fontSize: '0.8125rem', color: isDue ? '#d93025' : '#5f6368', fontWeight: isDue ? 500 : 400 }}>
                                            {isDue ? 'Past due' : format(new Date(a.dueDate), 'MMM d')}
                                        </Typography>
                                    )}
                                    {a.points && (
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>{a.points} pts</Typography>
                                    )}
                                    {sub && !isFaculty && (
                                        <Chip
                                            label={sub.status === 'graded' ? `${sub.grade}/${a.points}` : sub.status === 'submitted' ? 'Turned in' : sub.isLate ? 'Late' : sub.status}
                                            size="small"
                                            sx={{
                                                mt: 0.5, height: 20, fontSize: '0.625rem',
                                                bgcolor: sub.status === 'graded' ? '#e8f0fe' : sub.status === 'submitted' ? '#e6f4ea' : sub.isLate ? '#fce8e6' : '#f1f3f4',
                                                color: sub.status === 'graded' ? '#1967d2' : sub.status === 'submitted' ? '#137333' : sub.isLate ? '#c5221f' : '#5f6368',
                                            }}
                                        />
                                    )}
                                    {isFaculty && (
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.5 }}>
                                            {a.submissionCount} submitted
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}

            {filtered.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: '#dadce0', mb: 2 }} />
                    <Typography sx={{ color: '#5f6368' }}>No assignments match your filters</Typography>
                </Box>
            )}
        </Box>
    );
}
