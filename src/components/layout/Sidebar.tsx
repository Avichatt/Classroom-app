// ============================================
// Sidebar Component - Google Classroom Style
// ============================================
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography,
    Collapse,
} from '@mui/material';
import {
    Home as HomeIcon,
    CalendarToday as CalendarIcon,
    FolderOpen as FolderIcon,
    School as SchoolIcon,
    Settings as SettingsIcon,
    Archive as ArchiveIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Assignment as AssignmentIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AdminPanelSettings as AdminIcon,
    Grade as GradeIcon,
    ViewList as GradebookIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 280;

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, setSidebarOpen, classes } = useAppStore();
    const { user } = useAuthStore();
    const [teachingOpen, setTeachingOpen] = useState(true);
    const [enrolledOpen, setEnrolledOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    const handleNav = (path: string) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const teachingClasses = classes.filter((c) => c.createdBy === user?.id);
    const enrolledClasses = classes.filter((c) => c.createdBy !== user?.id);

    return (
        <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    top: 0,
                    height: '100%',
                    pt: '60px',
                },
            }}
        >
            <Box sx={{ overflow: 'auto', py: 1 }}>
                {/* Main Nav */}
                <List component="nav" sx={{ px: 1 }}>
                    <ListItemButton
                        selected={isActive('/')}
                        onClick={() => handleNav('/')}
                    >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                            <HomeIcon sx={{ color: isActive('/') ? '#1967d2' : '#5f6368' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Home"
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive('/') ? 500 : 400 }}
                        />
                    </ListItemButton>

                    <ListItemButton
                        selected={isActive('/calendar')}
                        onClick={() => handleNav('/calendar')}
                    >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                            <CalendarIcon sx={{ color: isActive('/calendar') ? '#1967d2' : '#5f6368' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Calendar"
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                    </ListItemButton>

                    {user?.role !== 'admin' && (
                        <ListItemButton
                            selected={isActive('/to-do')}
                            onClick={() => handleNav('/to-do')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <AssignmentIcon sx={{ color: isActive('/to-do') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="To-do"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}

                    {user?.role === 'student' && (
                        <ListItemButton
                            selected={isActive('/assignments')}
                            onClick={() => handleNav('/assignments')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <AssignmentIcon sx={{ color: isActive('/assignments') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Assignments"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}

                    {user?.role === 'student' && (
                        <ListItemButton
                            selected={isActive('/grades')}
                            onClick={() => handleNav('/grades')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <GradeIcon sx={{ color: isActive('/grades') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Grades"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}

                    {user?.role === 'faculty' && (
                        <ListItemButton
                            selected={isActive('/gradebook')}
                            onClick={() => handleNav('/gradebook')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <GradebookIcon sx={{ color: isActive('/gradebook') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Gradebook"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}

                    {(user?.role === 'faculty' || user?.role === 'admin') && (
                        <ListItemButton
                            selected={isActive('/dashboard')}
                            onClick={() => handleNav('/dashboard')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <DashboardIcon sx={{ color: isActive('/dashboard') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Dashboard"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}

                    {user?.role === 'admin' && (
                        <ListItemButton
                            selected={isActive('/admin')}
                            onClick={() => handleNav('/admin')}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <AdminIcon sx={{ color: isActive('/admin') ? '#1967d2' : '#5f6368' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Admin Panel"
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItemButton>
                    )}
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Teaching section - for faculty */}
                {user?.role === 'faculty' && teachingClasses.length > 0 && (
                    <>
                        <List component="nav" sx={{ px: 1 }}>
                            <ListItemButton onClick={() => setTeachingOpen(!teachingOpen)}>
                                <ListItemIcon sx={{ minWidth: 48 }}>
                                    <SchoolIcon sx={{ color: '#5f6368' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Teaching"
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                                />
                                {teachingOpen ? <ExpandLessIcon sx={{ color: '#5f6368' }} /> : <ExpandMoreIcon sx={{ color: '#5f6368' }} />}
                            </ListItemButton>
                            <Collapse in={teachingOpen}>
                                <List component="div" disablePadding>
                                    {teachingClasses.map((cls) => (
                                        <ListItemButton
                                            key={cls.id}
                                            sx={{ pl: 4 }}
                                            selected={isActive(`/class/${cls.id}`)}
                                            onClick={() => handleNav(`/class/${cls.id}`)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        bgcolor: cls.colorTheme,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 500 }}>
                                                        {cls.name.charAt(0)}
                                                    </Typography>
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={cls.name}
                                                secondary={cls.section}
                                                primaryTypographyProps={{ fontSize: '0.8125rem', noWrap: true }}
                                                secondaryTypographyProps={{ fontSize: '0.6875rem', noWrap: true }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </List>
                        <Divider sx={{ my: 1 }} />
                    </>
                )}

                {/* Enrolled section */}
                {enrolledClasses.length > 0 && (
                    <>
                        <List component="nav" sx={{ px: 1 }}>
                            <ListItemButton onClick={() => setEnrolledOpen(!enrolledOpen)}>
                                <ListItemIcon sx={{ minWidth: 48 }}>
                                    <PeopleIcon sx={{ color: '#5f6368' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Enrolled"
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                                />
                                {enrolledOpen ? <ExpandLessIcon sx={{ color: '#5f6368' }} /> : <ExpandMoreIcon sx={{ color: '#5f6368' }} />}
                            </ListItemButton>
                            <Collapse in={enrolledOpen}>
                                <List component="div" disablePadding>
                                    {enrolledClasses.map((cls) => (
                                        <ListItemButton
                                            key={cls.id}
                                            sx={{ pl: 4 }}
                                            selected={isActive(`/class/${cls.id}`)}
                                            onClick={() => handleNav(`/class/${cls.id}`)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        bgcolor: cls.colorTheme,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 500 }}>
                                                        {cls.name.charAt(0)}
                                                    </Typography>
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={cls.name}
                                                secondary={cls.section}
                                                primaryTypographyProps={{ fontSize: '0.8125rem', noWrap: true }}
                                                secondaryTypographyProps={{ fontSize: '0.6875rem', noWrap: true }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </List>
                        <Divider sx={{ my: 1 }} />
                    </>
                )}

                {/* Bottom Nav */}
                <List component="nav" sx={{ px: 1 }}>
                    <ListItemButton onClick={() => handleNav('/archived')}>
                        <ListItemIcon sx={{ minWidth: 48 }}>
                            <ArchiveIcon sx={{ color: '#5f6368' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Archived classes"
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                    </ListItemButton>
                    <ListItemButton onClick={() => handleNav('/settings')}>
                        <ListItemIcon sx={{ minWidth: 48 }}>
                            <SettingsIcon sx={{ color: '#5f6368' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Settings"
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                    </ListItemButton>
                </List>
            </Box>
        </Drawer>
    );
}
