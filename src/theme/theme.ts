// ============================================
// Google Classroom Theme - Material UI
// ============================================
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1967d2',
            light: '#4285f4',
            dark: '#174ea6',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#1e8e3e',
            light: '#34a853',
            dark: '#137333',
        },
        error: {
            main: '#d93025',
            light: '#ea4335',
            dark: '#b3261e',
        },
        warning: {
            main: '#e8710a',
            light: '#f9ab00',
            dark: '#c4601c',
        },
        info: {
            main: '#1967d2',
            light: '#4285f4',
        },
        success: {
            main: '#1e8e3e',
            light: '#34a853',
        },
        background: {
            default: '#f6f8fc',
            paper: '#ffffff',
        },
        text: {
            primary: '#202124',
            secondary: '#5f6368',
        },
        divider: '#e0e0e0',
    },
    typography: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 400,
            letterSpacing: 0,
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 400,
            letterSpacing: 0,
        },
        h3: {
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: 0,
        },
        h4: {
            fontSize: '1.125rem',
            fontWeight: 500,
        },
        h5: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        h6: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        body1: {
            fontSize: '0.875rem',
            letterSpacing: '0.01785714em',
            lineHeight: '1.25rem',
        },
        body2: {
            fontSize: '0.8125rem',
            letterSpacing: '0.01785714em',
        },
        button: {
            textTransform: 'none' as const,
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '0.0107142857em',
        },
        subtitle1: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        subtitle2: {
            fontSize: '0.75rem',
            color: '#5f6368',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    padding: '8px 24px',
                    textTransform: 'none' as const,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
                    },
                },
                outlined: {
                    borderColor: '#dadce0',
                    color: '#1967d2',
                    '&:hover': {
                        backgroundColor: '#f6f9fe',
                        borderColor: '#d2e3fc',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15)',
                        borderColor: 'transparent',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#202124',
                    boxShadow: 'none',
                    borderBottom: '1px solid #e0e0e0',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none',
                    boxShadow: '0 16px 10px 0 rgba(0,0,0,.04), 0 0 16px 0 rgba(0,0,0,.04)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0 25px 25px 0',
                    margin: '1px 0',
                    '&.Mui-selected': {
                        backgroundColor: '#e8f0fe',
                        color: '#1967d2',
                        '&:hover': {
                            backgroundColor: '#d2e3fc',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#1967d2',
                        },
                    },
                    '&:hover': {
                        backgroundColor: '#f1f3f4',
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minWidth: 0,
                    padding: '12px 24px',
                    color: '#5f6368',
                    '&.Mui-selected': {
                        color: '#1967d2',
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#1967d2',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 28,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)',
                    borderRadius: 16,
                    textTransform: 'none' as const,
                },
                extended: {
                    padding: '0 20px',
                    height: 48,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#3c4043',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: 4,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1967d2',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 4,
                },
            },
        },
    },
});

// Google Classroom color palette for class cards
export const classColors = [
    '#1967d2', // Blue
    '#1e8e3e', // Green
    '#e8710a', // Orange
    '#a142f4', // Purple
    '#d93025', // Red
    '#137333', // Dark Green
    '#9334e6', // Violet
    '#c4601c', // Brown
    '#185abc', // Dark Blue
    '#0d652d', // Forest Green
];

export const getClassColor = (index: number) => classColors[index % classColors.length];
