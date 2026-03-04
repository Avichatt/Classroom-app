// ============================================
// Header Component - Google Classroom Style
// ============================================
import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Badge,
    Menu,
    MenuItem,
    Divider,
    Tooltip,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Add as AddIcon,
    Notifications as NotificationsIcon,
    Apps as AppsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';



export default function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { toggleSidebar, unreadCount, setNotificationDrawerOpen } = useAppStore();
    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
    const [createAnchor, setCreateAnchor] = useState<null | HTMLElement>(null);

    const handleLogout = () => {
        setProfileAnchor(null);
        logout();
        navigate('/login');
    };

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const avatarColors = ['#1967d2', '#1e8e3e', '#e8710a', '#a142f4', '#d93025'];
    const avatarColor = avatarColors[userInitial.charCodeAt(0) % avatarColors.length];

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1, sm: 2 } }}>
                {/* Hamburger Menu */}
                <IconButton
                    edge="start"
                    onClick={toggleSidebar}
                    sx={{ mr: 1, color: '#5f6368' }}
                    aria-label="menu"
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo */}
                <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 2 }}
                    onClick={() => navigate('/')}
                >
                    <SchoolIcon sx={{ color: '#1967d2', fontSize: 32, mr: 1 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#5f6368',
                            fontSize: '22px',
                            fontWeight: 400,
                            letterSpacing: 0,
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        Classroom
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Create Button */}
                <Tooltip title="Create">
                    <IconButton
                        onClick={(e) => setCreateAnchor(e.currentTarget)}
                        sx={{ color: '#5f6368', mx: 0.5 }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                {/* Create Menu */}
                <Menu
                    anchorEl={createAnchor}
                    open={Boolean(createAnchor)}
                    onClose={() => setCreateAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        sx: { width: 200, mt: 1, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' },
                    }}
                >
                    {user?.role === 'faculty' && (
                        <MenuItem onClick={() => { setCreateAnchor(null); navigate('/create-class'); }}>
                            <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Create class</ListItemText>
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => { setCreateAnchor(null); navigate('/join-class'); }}>
                        <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Join class</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Notifications */}
                <Tooltip title="Notifications">
                    <IconButton
                        onClick={() => setNotificationDrawerOpen(true)}
                        sx={{ color: '#5f6368', mx: 0.5 }}
                    >
                        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 18, height: 18 } }}>
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>



                {/* Apps Grid */}
                <Tooltip title="Google Apps">
                    <IconButton sx={{ color: '#5f6368', mx: 0.5, display: { xs: 'none', md: 'flex' } }}>
                        <AppsIcon />
                    </IconButton>
                </Tooltip>

                {/* Profile */}
                <Tooltip title={user?.email || 'Account'}>
                    <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ ml: 0.5, p: 0.5 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: avatarColor,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            {userInitial}
                        </Avatar>
                    </IconButton>
                </Tooltip>

                {/* Profile Menu */}
                <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={() => setProfileAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        sx: {
                            width: 320,
                            mt: 1,
                            borderRadius: 3,
                            boxShadow: '0 4px 28px rgba(0,0,0,0.2)',
                            overflow: 'visible',
                        },
                    }}
                >
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: avatarColor,
                                fontSize: '2rem',
                                mb: 1,
                            }}
                        >
                            {userInitial}
                        </Avatar>
                        <Typography sx={{ fontWeight: 500, fontSize: '1rem', mt: 0.5 }}>{user?.name}</Typography>
                        <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>{user?.email}</Typography>
                        <Typography
                            sx={{
                                color: '#1967d2',
                                fontSize: '0.8125rem',
                                mt: 1,
                                cursor: 'pointer',
                                border: '1px solid #dadce0',
                                borderRadius: '100px',
                                px: 2,
                                py: 0.5,
                                '&:hover': { backgroundColor: '#f6f9fe' },
                            }}
                        >
                            Manage your Account
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>
                        <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: '#5f6368' }} /></ListItemIcon>
                        <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}>Settings</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setProfileAnchor(null); }}>
                        <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#5f6368' }} /></ListItemIcon>
                        <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}>Profile</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#5f6368' }} /></ListItemIcon>
                        <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}>Sign out</ListItemText>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
