// ============================================
// Login Page - Google Classroom Style
// ============================================
import { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const GOOGLE_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMiAxMyAxMC4yIDEzLjZjLTIuNS44LTUuMi0uMi02LjctMi4zLTEuNS0yLjEtMS41LTUtLjEtNy4xIDEuNC0yIDMuNi0zLjMgNS42LTMuMyAxLjYgMCAzLjEuNiA0LjIgMS43TDE1IDMuMUMxMy4zIDEuNSAxMS4xLjUgOC44LjUgNC4xLjUuMiA0LjIuMiA4LjljMCA0LjcgMy45IDguNCA4LjYgOC40IDIuMiAwIDQuMS0uNyA1LjUtMiAxLjYtMS40IDIuNS0zLjUgMi41LTUuOXoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik0yIDguOWMuMS0uNS4xLS45LjMtMS4zbC0yLjMtMS44Yy0uNiAxLjItLjkgMi41LS45IDMuOSAwIDEuNC4zIDIuNy45IDMuOUwyLjMgMTNjLS4yLS40LS4zLS44LS4zLTEuMyAwLS45LjEtMS45IDAtMi44eiIgZmlsbD0iI0ZCQkMwNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTguOCAzLjZjMS41IDAgMi45LjUgMy45IDEuNUwxNSAzLjFDMTMuMyAxLjUgMTEuMS41IDguOC41IDUuNS41IDIuNiAyLjMgMS4xIDUuMWwyLjMgMS44YzEtMi4xIDIuOC0zLjMgNS40LTMuM3oiIGZpbGw9IiNFQTQzMzUiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik04LjggMTcuNGMzIDAgNS4zLTEgNi44LTIuN2wtMi4zLTEuOGMtLjkuNy0yLjIgMS4yLTMuNyAxLjItMi43IDAtNC45LTEuOC01LjYtNC4xTC44IDExLjhjMS41IDIuOCA0LjQgNS42IDggNS42eiIgZmlsbD0iIzM0QTg1MyIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, loginAs, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter your email and password');
            return;
        }
        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid email or password. Try the demo logins below.');
        }
    };

    const handleQuickLogin = async (role: UserRole) => {
        try {
            await loginAs(role);
            navigate('/');
        } catch (e) {
            setError('Demo account not found. Please ensure the backend is running and the database is seeded.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f6f8fc 0%, #e8f0fe 100%)',
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 450,
                    p: 0,
                    border: '1px solid #dadce0',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(60,64,67,.15)',
                    overflow: 'visible',
                }}
            >
                {/* Header */}
                <Box sx={{ p: 4, pb: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: '#1967d2', mr: 1 }} />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 400, fontSize: '24px', color: '#202124', mb: 1 }}
                    >
                        Sign in
                    </Typography>
                    <Typography sx={{ color: '#5f6368', fontSize: '16px' }}>
                        to continue to Classroom
                    </Typography>
                </Box>

                {/* Form */}
                <Box component="form" onSubmit={handleLogin} sx={{ px: 4, pb: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                        autoFocus
                        autoComplete="email"
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 1 }}
                        autoComplete="current-password"
                    />

                    <Typography
                        component={Link}
                        to="/forgot-password"
                        sx={{
                            color: '#1967d2',
                            fontSize: '0.8125rem',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': { textDecoration: 'underline' },
                            display: 'inline-block',
                            mb: 3,
                        }}
                    >
                        Forgot password?
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography
                            component={Link}
                            to="/signup"
                            sx={{
                                color: '#1967d2',
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            Create account
                        </Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                px: 4,
                                py: 1,
                                bgcolor: '#1967d2',
                                '&:hover': { bgcolor: '#174ea6' },
                            }}
                        >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
                        </Button>
                    </Box>
                </Box>

                <Divider />

                {/* Google OAuth */}
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                            py: 1.2,
                            borderColor: '#dadce0',
                            color: '#3c4043',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            mb: 2,
                            '&:hover': {
                                backgroundColor: '#f8f9fa',
                                borderColor: '#d2e3fc',
                                boxShadow: '0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15)',
                            },
                        }}
                        startIcon={<img src={GOOGLE_LOGO} alt="Google" width={18} height={18} />}
                    >
                        Sign in with Google
                    </Button>

                    <Typography sx={{ color: '#5f6368', fontSize: '0.75rem', mb: 2 }}>
                        Or try a demo account:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            label="👨‍🎓 Student"
                            onClick={() => handleQuickLogin('student')}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: '#e8f0fe',
                                color: '#1967d2',
                                fontWeight: 500,
                                '&:hover': { bgcolor: '#d2e3fc' },
                            }}
                        />
                        <Chip
                            label="👨‍🏫 Faculty"
                            onClick={() => handleQuickLogin('faculty')}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: '#e6f4ea',
                                color: '#137333',
                                fontWeight: 500,
                                '&:hover': { bgcolor: '#ceead6' },
                            }}
                        />
                        <Chip
                            label="🔧 Admin"
                            onClick={() => handleQuickLogin('admin')}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: '#fce8e6',
                                color: '#c5221f',
                                fontWeight: 500,
                                '&:hover': { bgcolor: '#f9d0cd' },
                            }}
                        />
                    </Box>
                </Box>
            </Card>
        </Box>
    );
}
