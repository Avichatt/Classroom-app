// ============================================
// Home Page - Google Classroom Class Cards Grid
// ============================================
import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Avatar,
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Assignment as AssignmentIcon,
    FolderOpen as FolderIcon,
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    Archive as ArchiveIcon,
    ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { classCoverGradients } from '../../data/mockData';
import { ClassRoom } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { getClassColor } from '../../theme/theme';

export default function HomePage() {
    const navigate = useNavigate();
    const { classes, addClass, assignments } = useAppStore();
    const { user } = useAuthStore();
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [subject, setSubject] = useState('');
    const [room, setRoom] = useState('');
    const [classCode, setClassCode] = useState('');
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; classId: string } | null>(null);

    const handleCreateClass = () => {
        if (!className) return;
        const newClass: ClassRoom = {
            id: uuidv4(),
            name: className,
            section: section || 'Default Section',
            subject: subject || '',
            room: room || '',
            coverImage: '',
            colorTheme: getClassColor(classes.length),
            code: Math.random().toString(36).substring(2, 8),
            createdBy: user?.id || '',
            teacherName: user?.name || '',
            teacherAvatar: '',
            studentCount: 0,
            createdAt: new Date().toISOString(),
        };
        addClass(newClass);
        setCreateOpen(false);
        setClassName('');
        setSection('');
        setSubject('');
        setRoom('');
    };

    const getUpcomingCount = (classId: string) => {
        return assignments.filter(
            (a) => a.classId === classId && a.dueDate && new Date(a.dueDate) > new Date()
        ).length;
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
            {/* Class Cards Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 3,
                }}
            >
                {classes.map((cls, idx) => {
                    const gradient = classCoverGradients[cls.id] ||
                        `linear-gradient(135deg, ${cls.colorTheme} 0%, ${cls.colorTheme}cc 100%)`;
                    const upcoming = getUpcomingCount(cls.id);

                    return (
                        <Card
                            key={cls.id}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 2px 6px 2px rgba(60,64,67,.15)',
                                    borderColor: 'transparent',
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}
                        >
                            {/* Cover Section */}
                            <Box
                                sx={{
                                    background: gradient,
                                    p: 2,
                                    pb: 3,
                                    position: 'relative',
                                    minHeight: 100,
                                }}
                                onClick={() => navigate(`/class/${cls.id}`)}
                            >
                                {/* Menu button */}
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuAnchor({ el: e.currentTarget, classId: cls.id });
                                    }}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>

                                {/* Class Name */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 400,
                                        fontSize: '1.25rem',
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        pr: 4,
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                >
                                    {cls.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '0.8125rem',
                                        mt: 0.25,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {cls.section}
                                </Typography>

                                {/* Teacher Avatar */}
                                <Avatar
                                    sx={{
                                        position: 'absolute',
                                        right: 16,
                                        bottom: -20,
                                        width: 72,
                                        height: 72,
                                        bgcolor: cls.colorTheme,
                                        border: '2px solid #fff',
                                        fontSize: '2rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {cls.teacherName ? cls.teacherName.charAt(0) : '?'}
                                </Avatar>
                            </Box>

                            {/* Content */}
                            <CardContent
                                sx={{ flex: 1, pt: 2, pb: 0, cursor: 'pointer' }}
                                onClick={() => navigate(`/class/${cls.id}`)}
                            >
                                <Typography
                                    sx={{
                                        color: '#5f6368',
                                        fontSize: '0.8125rem',
                                        mt: 0.5,
                                    }}
                                >
                                    {cls.teacherName}
                                </Typography>
                                {upcoming > 0 && (
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                        <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                            {upcoming} assignment{upcoming > 1 ? 's' : ''} due soon
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>

                            {/* Actions */}
                            <CardActions sx={{ px: 2, py: 1, borderTop: '1px solid #e0e0e0', justifyContent: 'flex-end' }}>
                                <Tooltip title="Open assignments">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/class/${cls.id}?tab=classwork`);
                                        }}
                                        sx={{ color: '#5f6368' }}
                                    >
                                        <AssignmentIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Open folder">
                                    <IconButton size="small" sx={{ color: '#5f6368' }}>
                                        <FolderIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    );
                })}
            </Box>

            {/* Card Menu */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { width: 200, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' } }}
            >
                <MenuItem onClick={() => setMenuAnchor(null)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setMenuAnchor(null)}>
                    <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Copy invite link</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setMenuAnchor(null)}>
                    <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Archive</ListItemText>
                </MenuItem>
            </Menu>

            {/* FAB - Create/Join Class */}
            <Fab
                variant="extended"
                color="primary"
                onClick={() => user?.role === 'faculty' ? setCreateOpen(true) : setJoinOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    bgcolor: '#1967d2',
                    '&:hover': { bgcolor: '#174ea6' },
                    zIndex: 10,
                }}
            >
                <AddIcon sx={{ mr: 1 }} />
                {user?.role === 'faculty' ? 'Create' : 'Join'}
            </Fab>

            {/* Create Class Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>Create class</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Class name (required)"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} sx={{ color: '#1967d2' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateClass}
                        disabled={!className}
                        sx={{ bgcolor: '#1967d2' }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Join Class Dialog */}
            <Dialog open={joinOpen} onClose={() => setJoinOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>Join class</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#5f6368', fontSize: '0.875rem', mb: 2 }}>
                        Ask your teacher for the class code, then enter it here.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Class code"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        placeholder="e.g. abc123"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setJoinOpen(false)} sx={{ color: '#1967d2' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!classCode}
                        sx={{ bgcolor: '#1967d2' }}
                        onClick={() => { setJoinOpen(false); setClassCode(''); }}
                    >
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
