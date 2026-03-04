// ============================================
// Calendar Page
// ============================================
import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    IconButton,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    format,
    isSameMonth,
    isSameDay,
    isToday,
} from 'date-fns';

export default function CalendarPage() {
    const navigate = useNavigate();
    const { assignments, classes } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const getDaysInGrid = () => {
        const days: Date[] = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    };

    const getAssignmentsForDay = (day: Date) => {
        return assignments.filter((a) => {
            if (!a.dueDate) return false;
            return isSameDay(new Date(a.dueDate), day);
        });
    };

    const days = getDaysInGrid();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft />
                </IconButton>
                <Typography sx={{ mx: 2, fontWeight: 400, fontSize: '1.5rem', minWidth: 200, textAlign: 'center' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight />
                </IconButton>
            </Box>

            {/* Calendar Grid */}
            <Card sx={{ overflow: 'hidden' }}>
                {/* Week day headers */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        borderBottom: '1px solid #e0e0e0',
                    }}
                >
                    {weekDays.map((day) => (
                        <Box
                            key={day}
                            sx={{
                                p: 1.5,
                                textAlign: 'center',
                                borderRight: '1px solid #e0e0e0',
                                '&:last-child': { borderRight: 'none' },
                            }}
                        >
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', textTransform: 'uppercase' }}>
                                {day}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Calendar Days */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                    }}
                >
                    {days.map((day, i) => {
                        const dayAssignments = getAssignmentsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const today = isToday(day);

                        return (
                            <Box
                                key={i}
                                sx={{
                                    minHeight: 100,
                                    p: 0.75,
                                    borderBottom: '1px solid #e0e0e0',
                                    borderRight: '1px solid #e0e0e0',
                                    bgcolor: isCurrentMonth ? '#fff' : '#fafafa',
                                    '&:nth-of-type(7n)': { borderRight: 'none' },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.8125rem',
                                        color: isCurrentMonth ? '#202124' : '#b0b0b0',
                                        fontWeight: today ? 500 : 400,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: today ? '#1967d2' : 'transparent',
                                        ...(today && { color: '#fff' }),
                                        mb: 0.5,
                                    }}
                                >
                                    {format(day, 'd')}
                                </Typography>
                                {dayAssignments.map((a) => {
                                    const cls = classes.find((c) => c.id === a.classId);
                                    return (
                                        <Box
                                            key={a.id}
                                            sx={{
                                                bgcolor: cls?.colorTheme || '#1967d2',
                                                color: '#fff',
                                                borderRadius: 0.5,
                                                px: 0.75,
                                                py: 0.25,
                                                mb: 0.25,
                                                cursor: 'pointer',
                                                fontSize: '0.6875rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                '&:hover': { opacity: 0.9 },
                                            }}
                                            onClick={() => navigate(`/class/${a.classId}/assignment/${a.id}`)}
                                        >
                                            {a.title}
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Box>
            </Card>
        </Box>
    );
}
