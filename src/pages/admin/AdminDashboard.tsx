// ============================================
// Admin Dashboard - Main Container with Tab Nav
// ============================================
import { useState } from 'react';
import { Box, Tabs, Tab, Typography, Avatar } from '@mui/material';
import {
    Dashboard as OverviewIcon, People as UsersIcon, School as CohortIcon,
    Assignment as AssignmentOIcon, Plagiarism as PlagiarismIcon,
    Analytics as AnalyticsIcon, Security as AuditIcon, Settings as ConfigIcon,
    Language as LangIcon, Backup as BackupIcon, Warning as RiskIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import CohortCourseManagement from './CohortCourseManagement';
import AssignmentOversight from './AssignmentOversight';
import PlagiarismCenter from './PlagiarismCenter';
import SystemAnalytics from './SystemAnalytics';
import AuditLogs from './AuditLogs';
import SystemConfig from './SystemConfig';
import AccessibilitySettings from './AccessibilitySettings';
import DataBackup from './DataBackup';
import RiskMonitoring from './RiskMonitoring';

const tabs = [
    { label: 'Overview', icon: <OverviewIcon sx={{ fontSize: 18 }} /> },
    { label: 'Users', icon: <UsersIcon sx={{ fontSize: 18 }} /> },
    { label: 'Cohorts', icon: <CohortIcon sx={{ fontSize: 18 }} /> },
    { label: 'Assignments', icon: <AssignmentOIcon sx={{ fontSize: 18 }} /> },
    { label: 'Plagiarism', icon: <ShieldIcon sx={{ fontSize: 18 }} /> },
    { label: 'Analytics', icon: <AnalyticsIcon sx={{ fontSize: 18 }} /> },
    { label: 'Audit Logs', icon: <AuditIcon sx={{ fontSize: 18 }} /> },
    { label: 'Config', icon: <ConfigIcon sx={{ fontSize: 18 }} /> },
    { label: 'Accessibility', icon: <LangIcon sx={{ fontSize: 18 }} /> },
    { label: 'Backups', icon: <BackupIcon sx={{ fontSize: 18 }} /> },
    { label: 'Risk', icon: <RiskIcon sx={{ fontSize: 18 }} /> },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState(0);

    const renderPanel = () => {
        switch (activeTab) {
            case 0: return <AdminOverview />;
            case 1: return <UserManagement />;
            case 2: return <CohortCourseManagement />;
            case 3: return <AssignmentOversight />;
            case 4: return <PlagiarismCenter />;
            case 5: return <SystemAnalytics />;
            case 6: return <AuditLogs />;
            case 7: return <SystemConfig />;
            case 8: return <AccessibilitySettings />;
            case 9: return <DataBackup />;
            case 10: return <RiskMonitoring />;
            default: return <AdminOverview />;
        }
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
            {/* Top Header Bar */}
            <Box sx={{ bgcolor: '#1a1a2e', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#e94560', width: 40, height: 40 }}>A</Avatar>
                <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '1.125rem' }}>Admin Dashboard</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>System Control Center</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {[
                        { label: 'Students', value: '127' },
                        { label: 'Faculty', value: '4' },
                        { label: 'Courses', value: '9' },
                        { label: 'Uptime', value: '99.97%' },
                    ].map((s) => (
                        <Box key={s.label} sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{s.value}</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625rem' }}>{s.label}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', px: 1 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 44,
                        '& .MuiTab-root': {
                            minHeight: 44, textTransform: 'none', fontSize: '0.8125rem',
                            fontWeight: 400, color: '#5f6368', px: 2, gap: 0.5,
                            '&.Mui-selected': { color: '#1967d2', fontWeight: 500 },
                        },
                        '& .MuiTabs-indicator': { bgcolor: '#1967d2', height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    {tabs.map((t, i) => (
                        <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
                    ))}
                </Tabs>
            </Box>

            {/* Panel Content */}
            <Box sx={{ bgcolor: '#f6f8fc', minHeight: 'calc(100vh - 170px)' }}>
                {renderPanel()}
            </Box>
        </Box>
    );
}
