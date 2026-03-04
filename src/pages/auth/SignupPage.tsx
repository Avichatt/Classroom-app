// ============================================
// Signup Page
// ============================================
import { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { School as SchoolIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signup, isLoading } = useAuthStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        const success = await signup(name, email, password, role);
        if (success) navigate('/');
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
            <Card sx={{ width: '100%', maxWidth: 450, p: 4, border: '1px solid #dadce0', borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ fontSize: 48, color: '#1967d2', mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124', mb: 0.5 }}>
                        Create your Account
                    </Typography>
                    <Typography sx={{ color: '#5f6368', fontSize: '14px' }}>
                        to continue to Classroom
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSignup}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 2 }}
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>I am a</InputLabel>
                        <Select value={role} label="I am a" onChange={(e) => setRole(e.target.value as UserRole)}>
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="faculty">Faculty / Teacher</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                            component={Link}
                            to="/login"
                            sx={{
                                color: '#1967d2',
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            Sign in instead
                        </Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            sx={{ px: 4, bgcolor: '#1967d2', '&:hover': { bgcolor: '#174ea6' } }}
                        >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Create account'}
                        </Button>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
}
