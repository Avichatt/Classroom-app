// ============================================
// To-Do Page (Student)
// ============================================
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { format, isPast } from 'date-fns';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
    return value === index ? <Box>{children}</Box> : null;
}

export default function ToDoPage() {
    const navigate = useNavigate();
    const { classes, assignments, submissions } = useAppStore();
    const { user } = useAuthStore();
    const [tab, setTab] = useState(0);

    const mySubmissions = submissions.filter((s) => s.studentId === user?.id);

    // Assignments where student hasn't submitted
    const assigned = assignments.filter((a) => {
        const sub = mySubmissions.find((s) => s.assignmentId === a.id);
        return !sub || sub.status === 'missing';
    });

    // Assignments where student has submitted
    const done = assignments.filter((a) => {
        const sub = mySubmissions.find((s) => s.assignmentId === a.id);
        return sub && sub.status !== 'missing';
    });

    const renderAssignmentCard = (a: typeof assignments[0]) => {
        const cls = classes.find((c) => c.id === a.classId);
        const sub = mySubmissions.find((s) => s.assignmentId === a.id);
        const isDue = a.dueDate && isPast(new Date(a.dueDate));

        return (
            <Card
                key={a.id}
                sx={{
                    mb: 1.5,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' },
                }}
                onClick={() => navigate(`/class/${a.classId}/assignment/${a.id}`)}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: cls?.colorTheme || '#1967d2',
                                mr: 2,
                            }}
                        >
                            <AssignmentIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{a.title}</Typography>
                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                {cls?.name}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            {a.dueDate && (
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        color: isDue ? '#d93025' : '#5f6368',
                                        fontWeight: isDue ? 500 : 400,
                                    }}
                                >
                                    {isDue ? 'Past due' : `Due ${format(new Date(a.dueDate), 'MMM d')}`}
                                </Typography>
                            )}
                            {sub && (
                                <Chip
                                    label={
                                        sub.status === 'submitted' ? 'Turned in' :
                                            sub.status === 'graded' ? `${sub.grade}/${a.points}` :
                                                sub.status === 'late' ? 'Done late' : sub.status
                                    }
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: '0.6875rem',
                                        bgcolor:
                                            sub.status === 'submitted' ? '#e6f4ea' :
                                                sub.status === 'graded' ? '#e8f0fe' :
                                                    sub.status === 'late' ? '#fce8e6' : '#f1f3f4',
                                        color:
                                            sub.status === 'submitted' ? '#137333' :
                                                sub.status === 'graded' ? '#1967d2' :
                                                    sub.status === 'late' ? '#c5221f' : '#5f6368',
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124', mb: 2 }}>To-do</Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label={`Assigned (${assigned.length})`} />
                <Tab label={`Done (${done.length})`} />
            </Tabs>

            <TabPanel value={tab} index={0}>
                {assigned.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CheckIcon sx={{ fontSize: 64, color: '#1e8e3e', mb: 2 }} />
                        <Typography sx={{ color: '#5f6368', fontSize: '1rem' }}>All caught up!</Typography>
                        <Typography sx={{ color: '#80868b', fontSize: '0.875rem', mt: 0.5 }}>
                            No assignments due
                        </Typography>
                    </Box>
                ) : (
                    assigned.map(renderAssignmentCard)
                )}
            </TabPanel>

            <TabPanel value={tab} index={1}>
                {done.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: '#dadce0', mb: 2 }} />
                        <Typography sx={{ color: '#5f6368' }}>No completed assignments</Typography>
                    </Box>
                ) : (
                    done.map(renderAssignmentCard)
                )}
            </TabPanel>
        </Box>
    );
}
