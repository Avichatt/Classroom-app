// ============================================
// Grades Page - Gradebook & Distribution Chart
// ============================================
import { useMemo, useRef, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
    School as GradedIcon, TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

function GradeDistributionChart({ gradedSubs, assignments }: { gradedSubs: any[]; assignments: any[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Grade brackets
        const brackets = ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (<60)'];
        const colors = ['#1e8e3e', '#34a853', '#e8710a', '#ea8600', '#d93025'];
        const counts = [0, 0, 0, 0, 0];

        gradedSubs.forEach((s) => {
            const a = assignments.find((x: any) => x.id === s.assignmentId);
            if (!a?.points) return;
            const pct = ((s.grade || 0) / a.points) * 100;
            if (pct >= 90) counts[0]++;
            else if (pct >= 80) counts[1]++;
            else if (pct >= 70) counts[2]++;
            else if (pct >= 60) counts[3]++;
            else counts[4]++;
        });

        const maxCount = Math.max(...counts, 1);
        const w = rect.width;
        const h = rect.height;
        const barWidth = (w - 60) / brackets.length - 8;
        const chartH = h - 50;

        ctx.clearRect(0, 0, w, h);

        // Draw bars
        brackets.forEach((label, i) => {
            const barH = (counts[i] / maxCount) * (chartH - 20);
            const x = 40 + i * (barWidth + 8);
            const y = chartH - barH;

            // Bar
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, 4);
            ctx.fill();

            // Count label
            ctx.fillStyle = '#202124';
            ctx.font = '12px Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(counts[i]), x + barWidth / 2, y - 5);

            // Bracket label
            ctx.fillStyle = '#5f6368';
            ctx.font = '10px Roboto, sans-serif';
            ctx.fillText(label.split(' ')[0], x + barWidth / 2, chartH + 15);
            ctx.fillText(label.split(' ')[1] || '', x + barWidth / 2, chartH + 27);
        });

        // Y-axis line
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(35, 0);
        ctx.lineTo(35, chartH);
        ctx.stroke();
    }, [gradedSubs, assignments]);

    return (
        <canvas ref={canvasRef} style={{ width: '100%', height: 200, display: 'block' }} />
    );
}

function getLetterGrade(pct: number): { letter: string; color: string } {
    if (pct >= 93) return { letter: 'A', color: '#1e8e3e' };
    if (pct >= 90) return { letter: 'A-', color: '#1e8e3e' };
    if (pct >= 87) return { letter: 'B+', color: '#34a853' };
    if (pct >= 83) return { letter: 'B', color: '#34a853' };
    if (pct >= 80) return { letter: 'B-', color: '#34a853' };
    if (pct >= 77) return { letter: 'C+', color: '#e8710a' };
    if (pct >= 73) return { letter: 'C', color: '#e8710a' };
    if (pct >= 70) return { letter: 'C-', color: '#e8710a' };
    if (pct >= 60) return { letter: 'D', color: '#ea8600' };
    return { letter: 'F', color: '#d93025' };
}

export default function GradesPage() {
    const { assignments, submissions, classes } = useAppStore();
    const { user } = useAuthStore();

    const mySubs = submissions.filter((s) => s.studentId === user?.id);
    const gradedSubs = mySubs.filter((s) => s.status === 'graded' && s.grade !== undefined);

    const rows = useMemo(() => {
        return assignments
            .filter((a) => a.status === 'published')
            .map((a) => {
                const sub = mySubs.find((s) => s.assignmentId === a.id);
                const cls = classes.find((c) => c.id === a.classId);
                const pct = sub?.grade !== undefined && a.points ? Math.round((sub.grade / a.points) * 100) : null;
                const grade = pct !== null ? getLetterGrade(pct) : null;
                return { assignment: a, submission: sub, className: cls?.name, classColor: cls?.colorTheme, pct, grade };
            })
            .sort((a, b) => {
                if (a.assignment.dueDate && b.assignment.dueDate) {
                    return new Date(b.assignment.dueDate).getTime() - new Date(a.assignment.dueDate).getTime();
                }
                return 0;
            });
    }, [assignments, mySubs, classes]);

    const totalEarned = gradedSubs.reduce((sum, s) => sum + (s.grade || 0), 0);
    const totalMax = gradedSubs.reduce((sum, s) => {
        const a = assignments.find((x) => x.id === s.assignmentId);
        return sum + (a?.points || 0);
    }, 0);
    const overallPct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const overallGrade = getLetterGrade(overallPct);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124', mb: 3 }}>Grades</Typography>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 400, color: overallGrade.color }}>{overallGrade.letter}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Letter Grade</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 400, color: overallGrade.color }}>{overallPct}%</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Overall Score</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 400, color: '#1967d2' }}>{totalEarned}/{totalMax}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Points Earned</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 400, color: '#a142f4' }}>{gradedSubs.length}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Graded Tasks</Typography>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Gradebook Table */}
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Typography sx={{ p: 2, fontWeight: 500, fontSize: '1rem' }}>📝 Gradebook</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>Assignment</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>Class</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>Score</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>%</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>Grade</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#5f6368' }}>Feedback</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((r) => (
                                        <TableRow key={r.assignment.id}
                                            sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' }, '&:hover': { bgcolor: '#f1f3f4' } }}>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{r.assignment.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={r.className} size="small"
                                                    sx={{ height: 20, fontSize: '0.625rem', bgcolor: r.classColor + '20', color: r.classColor, fontWeight: 500, border: `1px solid ${r.classColor}40` }} />
                                            </TableCell>
                                            <TableCell align="center">
                                                {r.submission?.grade !== undefined ? (
                                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{r.submission.grade}/{r.assignment.points}</Typography>
                                                ) : (
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {r.pct !== null ? (
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: r.grade?.color }}>{r.pct}%</Typography>
                                                        <LinearProgress variant="determinate" value={r.pct}
                                                            sx={{
                                                                height: 3, borderRadius: 1.5, mt: 0.5, bgcolor: '#e0e0e0',
                                                                '& .MuiLinearProgress-bar': { bgcolor: r.grade?.color, borderRadius: 1.5 }
                                                            }} />
                                                    </Box>
                                                ) : <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>—</Typography>}
                                            </TableCell>
                                            <TableCell align="center">
                                                {r.grade ? (
                                                    <Chip label={r.grade.letter} size="small"
                                                        sx={{ height: 22, fontWeight: 600, fontSize: '0.75rem', bgcolor: r.grade.color + '18', color: r.grade.color }} />
                                                ) : (
                                                    <Chip label={r.submission ? 'Pending' : 'N/A'} size="small"
                                                        sx={{ height: 22, fontSize: '0.6875rem', bgcolor: '#f1f3f4', color: '#5f6368' }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.75rem', color: '#3c4043', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.submission?.feedback || '—'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Grade Distribution Chart */}
                <Box>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📊 Grade Distribution</Typography>
                            <GradeDistributionChart gradedSubs={gradedSubs} assignments={assignments} />
                        </CardContent>
                    </Card>

                    {/* Per-class breakdown */}
                    <Card>
                        <CardContent>
                            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📚 By Class</Typography>
                            {classes.map((cls) => {
                                const classSubs = gradedSubs.filter((s) => {
                                    const a = assignments.find((x) => x.id === s.assignmentId);
                                    return a?.classId === cls.id;
                                });
                                if (classSubs.length === 0) return null;
                                const earned = classSubs.reduce((sum, s) => sum + (s.grade || 0), 0);
                                const max = classSubs.reduce((sum, s) => {
                                    const a = assignments.find((x) => x.id === s.assignmentId);
                                    return sum + (a?.points || 0);
                                }, 0);
                                const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
                                const g = getLetterGrade(pct);
                                return (
                                    <Box key={cls.id} sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{cls.name}</Typography>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: g.color }}>{g.letter} ({pct}%)</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={pct}
                                            sx={{
                                                height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': { bgcolor: cls.colorTheme, borderRadius: 3 }
                                            }} />
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
