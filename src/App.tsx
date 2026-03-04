import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { socketService } from './services/socket';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import HomePage from './pages/home/HomePage';
import ClassDetailPage from './pages/class/ClassDetailPage';
import AssignmentDetailPage from './pages/assignment/AssignmentDetailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ToDoPage from './pages/todo/ToDoPage';
import CalendarPage from './pages/calendar/CalendarPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import AssignmentListPage from './pages/student/AssignmentListPage';
import GradesPage from './pages/student/GradesPage';

// Faculty Pages
import AssignmentCreatorPage from './pages/faculty/AssignmentCreatorPage';
import SubmissionsViewerPage from './pages/faculty/SubmissionsViewerPage';
import GradingInterfacePage from './pages/faculty/GradingInterfacePage';
import GradebookPage from './pages/faculty/GradebookPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Global data auto-fetcher
function GlobalDataHydrator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hydrate } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      hydrate();
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, isLoading]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <GlobalDataHydrator />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="class/:classId" element={<ClassDetailPage />} />
            <Route path="class/:classId/assignment/:assignmentId" element={<AssignmentDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="to-do" element={<ToDoPage />} />
            <Route path="calendar" element={<CalendarPage />} />

            {/* Student Routes */}
            <Route path="student-dashboard" element={<StudentDashboardPage />} />
            <Route path="assignments" element={<AssignmentListPage />} />
            <Route path="grades" element={<GradesPage />} />

            {/* Faculty Routes */}
            <Route path="class/:classId/create-assignment" element={<AssignmentCreatorPage />} />
            <Route path="class/:classId/assignment/:assignmentId/submissions" element={<SubmissionsViewerPage />} />
            <Route path="class/:classId/assignment/:assignmentId/grade/:submissionId" element={<GradingInterfacePage />} />
            <Route path="class/:classId/assignment/:assignmentId/grade" element={<SubmissionsViewerPage />} />
            <Route path="gradebook" element={<GradebookPage />} />

            <Route path="settings" element={<SettingsPlaceholder />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// Simple placeholder pages
function SettingsPlaceholder() {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#5f6368' }}>
      <h2 style={{ fontWeight: 400 }}>Settings</h2>
      <p>Settings page coming soon.</p>
    </div>
  );
}

function AdminPlaceholder() {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#5f6368' }}>
      <h2 style={{ fontWeight: 400 }}>Admin Panel</h2>
      <p>Admin panel coming soon.</p>
    </div>
  );
}

export default App;
