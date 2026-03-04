// ============================================
// Class Detail Page - Stream/Classwork/People tabs
// ============================================
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Avatar,
    IconButton,
    Card,
    CardContent,
    Button,
    TextField,
    Chip,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemAvatar,
    Select,
    FormControl,
    InputLabel,
    LinearProgress,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Assignment as AssignmentIcon,
    Info as InfoIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    YouTube as YouTubeIcon,
    Link as LinkIcon,
    InsertDriveFile as FileIcon,
    PersonAdd as PersonAddIcon,
    ContentCopy as CopyIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Add as AddIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { classCoverGradients, mockUsers } from '../../data/mockData';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Assignment } from '../../types';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
    return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function ClassDetailPage() {
    const { classId } = useParams<{ classId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { classes, assignments, submissions, announcements, addAnnouncement, addAssignment, getAssignmentsByClass, getAnnouncementsByClass } = useAppStore();
    const { user } = useAuthStore();

    const cls = classes.find((c) => c.id === classId);
    const classAssignments = classId ? getAssignmentsByClass(classId) : [];
    const classAnnouncements = classId ? getAnnouncementsByClass(classId) : [];

    const initialTab = searchParams.get('tab') === 'classwork' ? 1 : searchParams.get('tab') === 'people' ? 2 : 0;
    const [tabValue, setTabValue] = useState(initialTab);
    const [announcement, setAnnouncement] = useState('');
    const [showAnnInput, setShowAnnInput] = useState(false);
    const [createAssignOpen, setCreateAssignOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        points: 100,
        dueDate: '',
        topic: '',
    });

    if (!cls) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#5f6368' }}>Class not found</Typography>
            </Box>
        );
    }

    const gradient = classCoverGradients[cls.id] ||
        `linear-gradient(135deg, ${cls.colorTheme} 0%, ${cls.colorTheme}cc 100%)`;

    const isOwner = cls.createdBy === user?.id;
    const isFaculty = user?.role === 'faculty';

    const handlePostAnnouncement = () => {
        if (!announcement.trim()) return;
        addAnnouncement({
            id: uuidv4(),
            classId: cls.id,
            authorId: user?.id || '',
            authorName: user?.name || '',
            authorAvatar: '',
            content: announcement,
            attachments: [],
            comments: [],
            createdAt: new Date().toISOString(),
        });
        setAnnouncement('');
        setShowAnnInput(false);
    };

    const handleCreateAssignment = () => {
        if (!newAssignment.title) return;
        const assignment: Assignment = {
            id: uuidv4(),
            classId: cls.id,
            title: newAssignment.title,
            description: newAssignment.description,
            dueDate: newAssignment.dueDate || null,
            dueTime: '11:59 PM',
            points: newAssignment.points,
            topic: newAssignment.topic,
            attachments: [],
            createdBy: user?.id || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'published',
            allowLateSubmission: true,
            maxFileSize: 10,
            allowedFormats: ['.zip', '.pdf', '.py', '.java'],
            submissionCount: 0,
            gradedCount: 0,
        };
        addAssignment(assignment);
        setCreateAssignOpen(false);
        setNewAssignment({ title: '', description: '', points: 100, dueDate: '', topic: '' });
    };

    // Group assignments by topic
    const topicGroups = classAssignments.reduce<Record<string, Assignment[]>>((acc, a) => {
        const topic = a.topic || 'No topic';
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(a);
        return acc;
    }, {});

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* Cover Banner */}
            <Box
                sx={{
                    background: gradient,
                    height: { xs: 160, sm: 200 },
                    borderRadius: { xs: 0, sm: '0 0 8px 8px' },
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 3,
                    overflow: 'hidden',
                }}
            >
                {/* Decorative pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: -20,
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        right: 60,
                        top: 40,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                    }}
                />

                <Typography
                    variant="h4"
                    sx={{
                        color: '#fff',
                        fontWeight: 400,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        zIndex: 1,
                    }}
                >
                    {cls.name}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', zIndex: 1, mt: 0.5 }}>
                    {cls.section}
                </Typography>

                {/* Info button */}
                <Tooltip title="Class details">
                    <IconButton
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            color: '#fff',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #e0e0e0', px: { xs: 1, sm: 0 } }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{ minHeight: 48 }}
                >
                    <Tab label="Stream" sx={{ minHeight: 48 }} />
                    <Tab label="Classwork" sx={{ minHeight: 48 }} />
                    <Tab label="People" sx={{ minHeight: 48 }} />
                </Tabs>
            </Box>

            {/* ===== STREAM TAB ===== */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: { xs: 2, sm: 0 }, display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Left Sidebar */}
                    <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0 }}>
                        {/* Class Code Card */}
                        <Card sx={{ mb: 2, overflow: 'hidden' }}>
                            <Box sx={{ bgcolor: cls.colorTheme, p: 2 }}>
                                <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 500, mb: 0.5 }}>
                                    Class code
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 400, letterSpacing: 1 }}>
                                        {cls.code}
                                    </Typography>
                                    <Tooltip title="Copy code">
                                        <IconButton size="small" sx={{ color: '#fff' }}>
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Card>

                        {/* Upcoming Card */}
                        <Card>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1 }}>Upcoming</Typography>
                                {classAssignments.filter((a) => a.dueDate && !isPast(new Date(a.dueDate))).length === 0 ? (
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                                        No work due soon
                                    </Typography>
                                ) : (
                                    classAssignments
                                        .filter((a) => a.dueDate && !isPast(new Date(a.dueDate)))
                                        .slice(0, 3)
                                        .map((a) => (
                                            <Box
                                                key={a.id}
                                                sx={{
                                                    py: 0.5,
                                                    cursor: 'pointer',
                                                    '&:hover': { color: '#1967d2' },
                                                }}
                                                onClick={() => navigate(`/class/${cls.id}/assignment/${a.id}`)}
                                            >
                                                <Typography sx={{ fontSize: '0.8125rem', color: '#1967d2' }}>
                                                    {a.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>
                                                    Due {a.dueDate ? format(new Date(a.dueDate), 'MMM d') : 'No date'}
                                                </Typography>
                                            </Box>
                                        ))
                                )}
                                <Button
                                    size="small"
                                    sx={{ mt: 1, color: '#1967d2', textTransform: 'none', p: 0, minWidth: 0, fontSize: '0.8125rem' }}
                                    onClick={() => setTabValue(1)}
                                >
                                    View all
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Main Stream Content */}
                    <Box sx={{ flex: 1 }}>
                        {/* Announcement Input */}
                        {!showAnnInput ? (
                            <Card
                                sx={{
                                    mb: 3,
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' },
                                }}
                                onClick={() => setShowAnnInput(true)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: cls.colorTheme,
                                            mr: 2,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {user?.name?.charAt(0)}
                                    </Avatar>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                                        Announce something to your class
                                    </Typography>
                                </Box>
                            </Card>
                        ) : (
                            <Card sx={{ mb: 3, p: 0 }}>
                                <CardContent sx={{ p: 2, pb: '8px !important' }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Announce something to your class"
                                        value={announcement}
                                        onChange={(e) => setAnnouncement(e.target.value)}
                                        autoFocus
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#dadce0' },
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Box>
                                            <IconButton size="small"><AttachFileIcon fontSize="small" sx={{ color: '#5f6368' }} /></IconButton>
                                            <IconButton size="small"><YouTubeIcon fontSize="small" sx={{ color: '#5f6368' }} /></IconButton>
                                            <IconButton size="small"><LinkIcon fontSize="small" sx={{ color: '#5f6368' }} /></IconButton>
                                        </Box>
                                        <Box>
                                            <Button size="small" onClick={() => { setShowAnnInput(false); setAnnouncement(''); }} sx={{ mr: 1, color: '#5f6368' }}>
                                                Cancel
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={handlePostAnnouncement}
                                                disabled={!announcement.trim()}
                                                sx={{ bgcolor: '#1967d2' }}
                                            >
                                                Post
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stream Items */}
                        {classAnnouncements.map((ann) => (
                            <Card key={ann.id} sx={{ mb: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: cls.colorTheme,
                                                mr: 2,
                                                fontSize: '1rem',
                                            }}
                                        >
                                            {ann.authorName.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                {ann.authorName}
                                            </Typography>
                                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                                {format(new Date(ann.createdAt), 'MMM d, yyyy')}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ color: '#5f6368' }}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.875rem', color: '#3c4043', lineHeight: 1.5 }}>
                                        {ann.content}
                                    </Typography>
                                    {ann.comments.length > 0 && (
                                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                                            {ann.comments.map((comment) => (
                                                <Box key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', mr: 1.5, bgcolor: '#a142f4' }}>
                                                        {comment.authorName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                            <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                                                                {comment.authorName}
                                                            </Typography>
                                                            <Typography sx={{ color: '#5f6368', fontSize: '0.6875rem' }}>
                                                                {format(new Date(comment.createdAt), 'MMM d')}
                                                            </Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '0.8125rem', color: '#3c4043' }}>
                                                            {comment.content}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Assignment stream items */}
                        {classAssignments.map((a) => (
                            <Card
                                key={a.id}
                                sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' },
                                }}
                                onClick={() => navigate(`/class/${cls.id}/assignment/${a.id}`)}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: cls.colorTheme,
                                                mr: 2,
                                            }}
                                        >
                                            <AssignmentIcon sx={{ fontSize: 20 }} />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                {cls.teacherName} posted a new assignment: {a.title}
                                            </Typography>
                                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem', mt: 0.25 }}>
                                                {format(new Date(a.createdAt), 'MMM d, yyyy')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </TabPanel>

            {/* ===== CLASSWORK TAB ===== */}
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: { xs: 2, sm: 0 } }}>
                    {/* Create Button (Faculty only) */}
                    {isFaculty && (
                        <Box sx={{ mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateAssignOpen(true)}
                                sx={{ bgcolor: '#1967d2', '&:hover': { bgcolor: '#174ea6' } }}
                            >
                                Create
                            </Button>
                        </Box>
                    )}

                    {/* Topic Groups */}
                    {Object.entries(topicGroups).map(([topic, topicAssignments]) => (
                        <Box key={topic} sx={{ mb: 3 }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '1.1rem',
                                    color: cls.colorTheme,
                                    pb: 1,
                                    borderBottom: `2px solid ${cls.colorTheme}`,
                                    mb: 1.5,
                                }}
                            >
                                {topic}
                            </Typography>

                            {topicAssignments.map((a) => {
                                const isDue = a.dueDate && isPast(new Date(a.dueDate));
                                const studentSubmission = user?.role === 'student'
                                    ? submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id)
                                    : null;

                                return (
                                    <Card
                                        key={a.id}
                                        sx={{
                                            mb: 1,
                                            cursor: 'pointer',
                                            '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' },
                                        }}
                                        onClick={() => navigate(`/class/${cls.id}/assignment/${a.id}`)}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: cls.colorTheme,
                                                        mr: 2,
                                                    }}
                                                >
                                                    <AssignmentIcon sx={{ fontSize: 18 }} />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{a.title}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        {a.dueDate && (
                                                            <Typography sx={{ color: isDue ? '#d93025' : '#5f6368', fontSize: '0.75rem' }}>
                                                                {isDue ? 'Past due' : `Due ${format(new Date(a.dueDate), 'MMM d, h:mm a')}`}
                                                            </Typography>
                                                        )}
                                                        {!a.dueDate && (
                                                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>No due date</Typography>
                                                        )}
                                                        {a.points && (
                                                            <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                                                • {a.points} points
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {user?.role === 'student' && studentSubmission && (
                                                    <Chip
                                                        label={studentSubmission.status === 'submitted' ? 'Turned in' : studentSubmission.status === 'graded' ? `${studentSubmission.grade}/${a.points}` : studentSubmission.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: studentSubmission.status === 'submitted' ? '#e6f4ea' :
                                                                studentSubmission.status === 'graded' ? '#e8f0fe' :
                                                                    studentSubmission.status === 'late' ? '#fce8e6' : '#f1f3f4',
                                                            color: studentSubmission.status === 'submitted' ? '#137333' :
                                                                studentSubmission.status === 'graded' ? '#1967d2' :
                                                                    studentSubmission.status === 'late' ? '#c5221f' : '#5f6368',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                )}
                                                {user?.role === 'faculty' && (
                                                    <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                                        {a.submissionCount} turned in
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    ))}

                    {classAssignments.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AssignmentIcon sx={{ fontSize: 64, color: '#dadce0', mb: 2 }} />
                            <Typography sx={{ color: '#5f6368', fontSize: '1rem' }}>
                                {isFaculty ? 'Add assignments and other work for the class' : 'No classwork yet'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </TabPanel>

            {/* ===== PEOPLE TAB ===== */}
            <TabPanel value={tabValue} index={2}>
                <Box sx={{ px: { xs: 2, sm: 0 }, maxWidth: 800, mx: 'auto' }}>
                    {/* Teachers Section */}
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                pb: 1,
                                borderBottom: `2px solid ${cls.colorTheme}`,
                                mb: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: '1.25rem', color: cls.colorTheme, fontWeight: 400 }}>
                                Teachers
                            </Typography>
                            {isOwner && (
                                <IconButton size="small" sx={{ color: cls.colorTheme }}>
                                    <PersonAddIcon />
                                </IconButton>
                            )}
                        </Box>
                        <List sx={{ p: 0 }}>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: cls.colorTheme }}>{cls.teacherName ? cls.teacherName.charAt(0) : '?'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={cls.teacherName}
                                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Students Section */}
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                pb: 1,
                                borderBottom: `2px solid ${cls.colorTheme}`,
                                mb: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: '1.25rem', color: cls.colorTheme, fontWeight: 400 }}>
                                Students
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                                    {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
                                </Typography>
                                {isOwner && (
                                    <IconButton size="small" sx={{ color: cls.colorTheme }}>
                                        <PersonAddIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {mockUsers
                                .filter((u) => u.role === 'student')
                                .map((student) => (
                                    <ListItem key={student.id} sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: '#a142f4' }}>{student.name.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={student.name}
                                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                                        />
                                    </ListItem>
                                ))}
                        </List>
                    </Box>
                </Box>
            </TabPanel>

            {/* Create Assignment Dialog */}
            <Dialog open={createAssignOpen} onClose={() => setCreateAssignOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create assignment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Title"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Instructions (optional)"
                        multiline
                        minRows={3}
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label="Points"
                            type="number"
                            value={newAssignment.points}
                            onChange={(e) => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) || 0 })}
                            sx={{ width: 120 }}
                        />
                        <TextField
                            label="Due date"
                            type="datetime-local"
                            value={newAssignment.dueDate}
                            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        label="Topic (optional)"
                        value={newAssignment.topic}
                        onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateAssignOpen(false)} sx={{ color: '#5f6368' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateAssignment}
                        disabled={!newAssignment.title}
                        sx={{ bgcolor: '#1967d2' }}
                    >
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
