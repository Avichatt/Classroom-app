// ============================================
// System Analytics Dashboard
// ============================================
import { useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { submissionTrends, peakSubmissionHours, gradingTimeByFaculty, gradeDistribution } from '../../data/adminMockData';

function useCanvasChart(drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: any[], w = 500, h = 220) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        c.width = w * dpr; c.height = h * dpr;
        ctx.scale(dpr, dpr); c.style.width = `${w}px`; c.style.height = `${h}px`;
        ctx.clearRect(0, 0, w, h);
        drawFn(ctx, w, h);
    }, deps);
    return ref;
}

export default function SystemAnalytics() {
    // Submission Trends (Line)
    const trendsRef = useCanvasChart((ctx, w, h) => {
        const data = submissionTrends;
        const max = Math.max(...data.map((d) => d.count));
        const padL = 40, padR = 20, padT = 20, padB = 35;
        const cW = w - padL - padR, cH = h - padT - padB;
        const stepX = cW / (data.length - 1);

        // Grid lines
        ctx.strokeStyle = '#f1f3f4'; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padT + (cH / 4) * i;
            ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
            ctx.fillStyle = '#9aa0a6'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
            ctx.fillText(String(Math.round(max - (max / 4) * i)), padL - 8, y + 4);
        }

        // Gradient fill
        const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
        grad.addColorStop(0, 'rgba(25,103,210,0.2)'); grad.addColorStop(1, 'rgba(25,103,210,0.01)');
        ctx.beginPath(); ctx.moveTo(padL, h - padB);
        data.forEach((d, i) => { ctx.lineTo(padL + i * stepX, padT + cH - (d.count / max) * cH); });
        ctx.lineTo(padL + (data.length - 1) * stepX, h - padB); ctx.fillStyle = grad; ctx.fill();

        // Line
        ctx.beginPath(); ctx.strokeStyle = '#1967d2'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
        data.forEach((d, i) => { const x = padL + i * stepX, y = padT + cH - (d.count / max) * cH; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.stroke();

        // Dots + labels
        data.forEach((d, i) => {
            const x = padL + i * stepX, y = padT + cH - (d.count / max) * cH;
            ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#1967d2'; ctx.fill();
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
            ctx.fillStyle = '#5f6368'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
            ctx.fillText(d.date, x, h - padB + 15);
        });
    }, []);

    // Peak Hours (Bar)
    const peakRef = useCanvasChart((ctx, w, h) => {
        const data = peakSubmissionHours;
        const max = Math.max(...data.map((d) => d.count));
        const padL = 40, padB = 35, padT = 15;
        const barW = (w - padL - 20) / data.length - 4;

        data.forEach((d, i) => {
            const x = padL + i * (barW + 4);
            const barH = ((h - padT - padB) * d.count) / max;
            const isPeak = d.count === max;
            ctx.fillStyle = isPeak ? '#d93025' : '#1967d2';
            ctx.globalAlpha = isPeak ? 1 : 0.7;
            const y = h - padB - barH, r = 3;
            ctx.beginPath();
            ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, h - padB); ctx.lineTo(x, h - padB);
            ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.fill(); ctx.globalAlpha = 1;

            ctx.fillStyle = '#5f6368'; ctx.font = '8px Inter'; ctx.textAlign = 'center';
            ctx.fillText(d.hour, x + barW / 2, h - padB + 14);
            if (d.count > max * 0.3) {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter';
                ctx.fillText(String(d.count), x + barW / 2, h - padB - barH / 2 + 3);
            }
        });
    }, []);

    // Grading Time (Horizontal bar)
    const gradingRef = useCanvasChart((ctx, w, h) => {
        const data = gradingTimeByFaculty;
        const max = Math.max(...data.map((d) => d.avgHours));
        const barH = 30, gap = 15, padL = 130, padR = 50;

        data.forEach((d, i) => {
            const y = 20 + i * (barH + gap);
            const barW = ((w - padL - padR) * d.avgHours) / max;
            const color = d.avgHours <= 18 ? '#1e8e3e' : d.avgHours <= 24 ? '#1967d2' : '#e8710a';

            ctx.fillStyle = color; ctx.globalAlpha = 0.85;
            const r = 4;
            ctx.beginPath();
            ctx.moveTo(padL, y + r); ctx.lineTo(padL, y + barH - r);
            ctx.quadraticCurveTo(padL, y + barH, padL + r, y + barH);
            ctx.lineTo(padL + barW - r, y + barH);
            ctx.quadraticCurveTo(padL + barW, y + barH, padL + barW, y + barH - r);
            ctx.lineTo(padL + barW, y + r);
            ctx.quadraticCurveTo(padL + barW, y, padL + barW - r, y);
            ctx.lineTo(padL + r, y);
            ctx.quadraticCurveTo(padL, y, padL, y + r);
            ctx.fill(); ctx.globalAlpha = 1;

            ctx.fillStyle = '#3c4043'; ctx.font = '11px Inter'; ctx.textAlign = 'right';
            ctx.fillText(d.name, padL - 10, y + barH / 2 + 4);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
            ctx.fillText(`${d.avgHours}h`, padL + barW / 2, y + barH / 2 + 4);
        });
    }, [], 500, 200);

    // AI Metrics cards
    const aiMetrics = [
        { label: 'Summary Generation', value: '1.2s', sub: 'avg latency', color: '#1967d2' },
        { label: 'Plagiarism Detection', value: '3.8s', sub: 'avg runtime', color: '#e8710a' },
        { label: 'LLM API Calls', value: '2,847', sub: 'this month', color: '#a142f4' },
        { label: 'API Cost', value: '$124.50', sub: 'this month', color: '#1e8e3e' },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Academic Analytics */}
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📈 Academic Analytics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 1 }}>Submission Trends (Last 10 Days)</Typography>
                        <canvas ref={trendsRef} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 1 }}>Average Grading Time by Faculty</Typography>
                        <canvas ref={gradingRef} />
                    </CardContent>
                </Card>
            </Box>

            {/* Behavioral Analytics */}
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🧠 Behavioral Analytics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 1 }}>Peak Submission Hours</Typography>
                        <canvas ref={peakRef} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 2 }}>Student Engagement</Typography>
                        {[
                            { label: 'Active daily users', value: '78%', pct: 78, color: '#1967d2' },
                            { label: 'Reminder open rate', value: '64%', pct: 64, color: '#1e8e3e' },
                            { label: 'On-time submission rate', value: '86%', pct: 86, color: '#a142f4' },
                            { label: 'Assignment view rate', value: '92%', pct: 92, color: '#e8710a' },
                        ].map((e) => (
                            <Box key={e.label} sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.8125rem' }}>{e.label}</Typography>
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: e.color }}>{e.value}</Typography>
                                </Box>
                                <Box sx={{ height: 6, bgcolor: '#f1f3f4', borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ height: '100%', width: `${e.pct}%`, bgcolor: e.color, borderRadius: 3 }} />
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Box>

            {/* AI Metrics */}
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🤖 AI Metrics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {aiMetrics.map((m) => (
                    <Card key={m.label} sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: m.color }}>{m.value}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{m.label}</Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: '#9aa0a6' }}>{m.sub}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
