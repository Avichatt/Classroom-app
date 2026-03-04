// ============================================
// Assignment Oversight Panel
// ============================================
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Select, MenuItem, FormControl,
    InputLabel, LinearProgress, Chip, TextField,
} from '@mui/material';
import { useAppStore } from '../../store/appStore';

export default function AssignmentOversight() {
    const { assignments, submissions, classes } = useAppStore();
    const [cohortFilter, setCohortFilter] = useState('all');
    const [facultyFilter, setFacultyFilter] = useState('all');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stats = useMemo(() => {
        return assignments.map((a) => {
            const cls = classes.find((c) => c.id === a.classId);
            const subs = submissions.filter((s) => s.assignmentId === a.id);
            const graded = subs.filter((s) => s.grade !== undefined).length;
            const late = subs.filter((s) => s.isLate).length;
            const plag = subs.filter((s) => (s.plagiarismScore || 0) > 30).length;
            return {
                ...a, className: cls?.name || '', teacherName: cls?.teacherName || '',
                totalSubs: subs.length, gradedCount: graded, lateCount: late,
                plagCount: plag, subRate: cls ? Math.round((subs.length / cls.studentCount) * 100) : 0,
                lateRate: subs.length ? Math.round((late / subs.length) * 100) : 0,
            };
        });
    }, [assignments, submissions, classes]);

    // Canvas grade distribution
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 400 * dpr; canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr); canvas.style.width = '400px'; canvas.style.height = '180px';

        const grades = [
            { label: 'A (90-100)', count: 12, color: '#1e8e3e' },
            { label: 'B (80-89)', count: 18, color: '#1967d2' },
            { label: 'C (70-79)', count: 8, color: '#e8710a' },
            { label: 'D (60-69)', count: 4, color: '#ea8600' },
            { label: 'F (<60)', count: 2, color: '#d93025' },
        ];
        const maxCount = Math.max(...grades.map((g) => g.count));
        const barW = 50, gap = 25, startX = 40, chartH = 130;
        ctx.clearRect(0, 0, 400, 180);

        grades.forEach((g, i) => {
            const x = startX + i * (barW + gap);
            const barH = (g.count / maxCount) * chartH;
            ctx.fillStyle = g.color;
            ctx.beginPath();
            const r = 4; const y = 150 - barH;
            ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y); ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, 150); ctx.lineTo(x, 150); ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y); ctx.fill();

            ctx.fillStyle = '#3c4043'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(g.label, x + barW / 2, 168);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter';
            ctx.fillText(String(g.count), x + barW / 2, 150 - barH / 2 + 4);
        });
    }, []);

    const rateChip = (rate: number, type: 'sub' | 'late' | 'plag') => {
        let color = '#1e8e3e', bg = '#e6f4ea';
        if (type === 'sub' && rate < 50) { color = '#d93025'; bg = '#fce8e6'; }
        else if (type === 'late' && rate > 20) { color = '#e8710a'; bg = '#fef7e0'; }
        else if (type === 'plag') { color = rate > 0 ? '#d93025' : '#5f6368'; bg = rate > 0 ? '#fce8e6' : '#f1f3f4'; }
        return <Chip label={`${rate}%`} size="small" sx={{ height: 22, fontSize: '0.6875rem', bgcolor: bg, color, fontWeight: 500 }} />;
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Summary Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Assignments', value: stats.length, color: '#1967d2' },
                    { label: 'Avg Submission Rate', value: `${Math.round(stats.reduce((s, a) => s + a.subRate, 0) / (stats.length || 1))}%`, color: '#1e8e3e' },
                    { label: 'Avg Late Rate', value: `${Math.round(stats.reduce((s, a) => s + a.lateRate, 0) / (stats.length || 1))}%`, color: '#e8710a' },
                    { label: 'Plagiarism Alerts', value: stats.reduce((s, a) => s + a.plagCount, 0), color: '#d93025' },
                ].map((s) => (
                    <Card key={s.label} sx={{ flex: 1, border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: s.color }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>{s.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 3 }}>
                {/* Table */}
                <Card>
                    <Box sx={{ display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #e0e0e0' }}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Cohort</InputLabel>
                            <Select value={cohortFilter} label="Cohort" onChange={(e) => setCohortFilter(e.target.value)}>
                                <MenuItem value="all">All Cohorts</MenuItem>
                                <MenuItem value="fall">Fall 2025</MenuItem>
                                <MenuItem value="spring">Spring 2026</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Faculty</InputLabel>
                            <Select value={facultyFilter} label="Faculty" onChange={(e) => setFacultyFilter(e.target.value)}>
                                <MenuItem value="all">All Faculty</MenuItem>
                                <MenuItem value="smith">Dr. John Smith</MenuItem>
                                <MenuItem value="davis">Dr. Emily Davis</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Assignment</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sub. Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Late %</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Plag.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Graded</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.map((a) => (
                                    <TableRow key={a.id} sx={{ '&:hover': { bgcolor: '#f1f3f4' } }}>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{a.title}</Typography>
                                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>{a.points} pts</Typography>
                                        </TableCell>
                                        <TableCell><Typography sx={{ fontSize: '0.8125rem' }}>{a.className}</Typography></TableCell>
                                        <TableCell>{rateChip(a.subRate, 'sub')}</TableCell>
                                        <TableCell>{rateChip(a.lateRate, 'late')}</TableCell>
                                        <TableCell>
                                            {a.plagCount > 0 ? (
                                                <Chip label={`${a.plagCount} flags`} size="small" sx={{ height: 22, fontSize: '0.625rem', bgcolor: '#fce8e6', color: '#d93025' }} />
                                            ) : <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>—</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress variant="determinate" value={a.totalSubs ? (a.gradedCount / a.totalSubs) * 100 : 0}
                                                    sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#f1f3f4', '& .MuiLinearProgress-bar': { bgcolor: '#1967d2', borderRadius: 3 } }} />
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368', whiteSpace: 'nowrap' }}>
                                                    {a.gradedCount}/{a.totalSubs}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                {/* Grade Distribution Chart */}
                <Card sx={{ minWidth: 420 }}>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 2 }}>📊 Grade Distribution</Typography>
                        <canvas ref={canvasRef} />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
