// ============================================
// Grading Interface - Side-by-side view
// ============================================
import { useState, useMemo } from 'react';
import {
    Box, Typography, Card, CardContent, TextField, Button, Avatar,
    Chip, IconButton, Divider, Paper, LinearProgress, Slider,
} from '@mui/material';
import {
    ArrowBack as BackIcon, NavigateNext as NextIcon, NavigateBefore as PrevIcon,
    InsertDriveFile as FileIcon, CheckCircle as CheckIcon, Save as SaveIcon,
    Description as DocIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';

export default function GradingInterfacePage() {
    const navigate = useNavigate();
    const { classId, assignmentId, submissionId } = useParams();
    const { classes, assignments, submissions, updateSubmission } = useAppStore();

    const cls = classes.find((c) => c.id === classId);
    const assignment = assignments.find((a) => a.id === assignmentId);
    const allSubs = submissions.filter((s) => s.assignmentId === assignmentId && s.status !== 'missing');
    const currentIdx = allSubs.findIndex((s) => s.id === submissionId);
    const sub = allSubs[currentIdx];

    const [grade, setGrade] = useState<string>(sub?.grade?.toString() || '');
    const [feedback, setFeedback] = useState(sub?.feedback || '');
    const [rubricScores, setRubricScores] = useState<Record<string, number>>(
        sub?.rubricScores || {}
    );
    const [saved, setSaved] = useState(false);

    const rubric = assignment?.rubric || [];
    const totalRubric = Object.values(rubricScores).reduce((sum, v) => sum + v, 0);

    const handleRubricChange = (criterionId: string, value: number) => {
        const updated = { ...rubricScores, [criterionId]: value };
        setRubricScores(updated);
        const total = Object.values(updated).reduce((sum, v) => sum + v, 0);
        setGrade(total.toString());
    };

    const handleSave = () => {
        if (!sub) return;
        updateSubmission(sub.id, {
            grade: parseInt(grade) || 0,
            feedback,
            rubricScores: rubric.length > 0 ? rubricScores : undefined,
            status: 'graded',
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const navigateToSub = (idx: number) => {
        if (idx >= 0 && idx < allSubs.length) {
            navigate(`/class/${classId}/assignment/${assignmentId}/grade/${allSubs[idx].id}`, { replace: true });
            const next = allSubs[idx];
            setGrade(next.grade?.toString() || '');
            setFeedback(next.feedback || '');
            setRubricScores(next.rubricScores || {});
        }
    };

    if (!sub || !assignment) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: '#5f6368' }}>Submission not found.</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
            {/* Top bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(`/class/${classId}/assignment/${assignmentId}/submissions`)} sx={{ mr: 1 }}>
                    <BackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#202124' }}>
                        Grading: {assignment.title}
                    </Typography>
                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>{cls?.name}</Typography>
                </Box>

                {/* Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton disabled={currentIdx <= 0} onClick={() => navigateToSub(currentIdx - 1)}>
                        <PrevIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '0.875rem', color: '#5f6368' }}>
                        {currentIdx + 1} of {allSubs.length}
                    </Typography>
                    <IconButton disabled={currentIdx >= allSubs.length - 1} onClick={() => navigateToSub(currentIdx + 1)}>
                        <NextIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Side-by-side layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, minHeight: 'calc(100vh - 200px)' }}>
                {/* Left: Student Submission */}
                <Box>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            {/* Student Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#1967d2', mr: 1.5 }}>{sub.studentName.charAt(0)}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 500 }}>{sub.studentName}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Typography sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                                            {sub.submittedAt && format(new Date(sub.submittedAt), 'MMM d, yyyy h:mm a')}
                                        </Typography>
                                        {sub.isLate && <Chip label="Late" size="small" sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#fce8e6', color: '#c5221f' }} />}
                                    </Box>
                                </Box>
                                {sub.plagiarismScore !== undefined && (
                                    <Chip label={`Plagiarism: ${sub.plagiarismScore}%`} size="small"
                                        sx={{ bgcolor: sub.plagiarismScore > 30 ? '#fce8e6' : '#e6f4ea', color: sub.plagiarismScore > 30 ? '#c5221f' : '#137333', fontSize: '0.6875rem' }} />
                                )}
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Files */}
                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1 }}>📁 Submitted Files</Typography>
                            {sub.files.map((f) => (
                                <Paper key={f.id} variant="outlined" sx={{ p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <FileIcon sx={{ color: '#5f6368' }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{f.name}</Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                            {(f.size / 1024).toFixed(0)} KB • {f.type}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}

                            {/* Text Entry */}
                            {sub.textEntry && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1 }}>📝 Text Entry</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                                        <Typography sx={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                            {sub.textEntry}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* AI Summary */}
                            {sub.aiSummary && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1 }}>🤖 AI Summary</Typography>
                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#e8f0fe', border: '1px solid #c2d7f0' }}>
                                        <Typography sx={{ fontSize: '0.8125rem', color: '#174ea6' }}>{sub.aiSummary}</Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* File Preview placeholder */}
                            <Box sx={{ mt: 2, border: '2px dashed #e0e0e0', borderRadius: 1, p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <DocIcon sx={{ fontSize: 48, color: '#dadce0', mb: 1 }} />
                                <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>File preview area</Typography>
                                <Typography sx={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Click on a file to preview</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Right: Grading Panel */}
                <Box>
                    <Card sx={{ position: 'sticky', top: 80 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🏆 Grade & Feedback</Typography>

                            {/* Score Input */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <TextField label="Score" type="number" value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    sx={{ width: 100 }}
                                    inputProps={{ min: 0, max: assignment.points || 100 }}
                                />
                                <Typography sx={{ fontSize: '1.25rem', color: '#5f6368' }}>/ {assignment.points} pts</Typography>
                                {grade && assignment.points && (
                                    <Chip label={`${Math.round((parseInt(grade) / assignment.points) * 100)}%`}
                                        sx={{ fontWeight: 600, bgcolor: parseInt(grade) / assignment.points >= 0.8 ? '#e6f4ea' : '#fef7e0', color: parseInt(grade) / assignment.points >= 0.8 ? '#137333' : '#9a6700' }} />
                                )}
                            </Box>

                            {/* Rubric Scoring */}
                            {rubric.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1.5 }}>📝 Rubric Scoring</Typography>
                                    {rubric.map((r) => (
                                        <Paper key={r.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{r.title}</Typography>
                                                <Typography sx={{ fontSize: '0.8125rem', color: '#1967d2', fontWeight: 500 }}>
                                                    {rubricScores[r.id] || 0} / {r.maxPoints}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368', mb: 1 }}>{r.description}</Typography>
                                            <Slider
                                                value={rubricScores[r.id] || 0}
                                                onChange={(_, v) => handleRubricChange(r.id, v as number)}
                                                min={0} max={r.maxPoints} step={1}
                                                sx={{ color: '#1967d2', '& .MuiSlider-thumb': { width: 16, height: 16 } }}
                                            />
                                        </Paper>
                                    ))}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Total</Typography>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1967d2' }}>
                                            {totalRubric} / {rubric.reduce((sum, r) => sum + r.maxPoints, 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Feedback */}
                            <TextField label="Feedback" multiline minRows={4} maxRows={10} fullWidth
                                value={feedback} onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Write detailed feedback for the student..."
                                sx={{ mb: 3, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }} />

                            {/* Actions */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="contained" fullWidth startIcon={saved ? <CheckIcon /> : <SaveIcon />}
                                    onClick={handleSave}
                                    sx={{ textTransform: 'none', bgcolor: saved ? '#1e8e3e' : '#1967d2' }}>
                                    {saved ? 'Saved!' : 'Save Grade'}
                                </Button>
                                {currentIdx < allSubs.length - 1 && (
                                    <Button variant="outlined" startIcon={<NextIcon />}
                                        onClick={() => { handleSave(); setTimeout(() => navigateToSub(currentIdx + 1), 300); }}
                                        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
                                        Save & Next
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
