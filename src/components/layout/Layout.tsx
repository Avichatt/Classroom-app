// ============================================
// Main Layout Wrapper
// ============================================
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationsPanel from '../notifications/NotificationsPanel';

export default function Layout() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f8fc' }}>
            <Header />
            <Sidebar />
            <NotificationsPanel />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    minHeight: '100vh',
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }} />
                <Outlet />
            </Box>
        </Box>
    );
}
