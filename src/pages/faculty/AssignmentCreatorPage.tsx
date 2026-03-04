// ============================================
// Assignment Creator Page
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, TextField, Button, IconButton,
    Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
    Divider, Chip, Avatar, Paper,
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, AttachFile as AttachIcon,
    Close as CloseIcon, ArrowBack as BackIcon, DateRange as DateIcon,
    Save as SaveIcon, Publish as PublishIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { v4 as uuid } from 'uuid';
import { RubricCriterion, Assignment } from '../../types';

export default function AssignmentCreatorPage() {
    const navigate = useNavigate();
    const { classId } = useParams();
    const { classes, addAssignment } = useAppStore();
    const { user } = useAuthStore();
    const cls = classes.find((c) => c.id === classId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('23:59');
    const [points, setPoints] = useState<string>('100');
    const [topic, setTopic] = useState('');
    const [maxFileSize, setMaxFileSize] = useState('50');
    const [allowedFormats, setAllowedFormats] = useState('.zip,.pdf,.py,.java,.js');
    const [allowLate, setAllowLate] = useState(true);
    const [rubric, setRubric] = useState<RubricCriterion[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);

    const addRubricItem = () => {
        setRubric([...rubric, { id: uuid(), title: '', description: '', maxPoints: 10 }]);
    };
    const updateRubric = (id: string, field: string, value: any) => {
        setRubric(rubric.map((r) => r.id === id ? { ...r, [field]: value } : r));
    };
    const removeRubric = (id: string) => setRubric(rubric.filter((r) => r.id !== id));

    const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setAttachments([...attachments, ...Array.from(e.target.files)]);
    };

    const totalRubricPoints = rubric.reduce((sum, r) => sum + r.maxPoints, 0);

    const handleSave = (status: 'draft' | 'published') => {
        if (!title.trim()) return;
        const assignment: Assignment = {
            id: uuid(),
            classId: classId || '',
            title: title.trim(),
            description: description.trim(),
            instructions: instructions.trim() || undefined,
            dueDate: dueDate ? `${dueDate}T${dueTime}:00Z` : null,
            dueTime: dueTime || undefined,
            points: parseInt(points) || null,
            topic: topic.trim() || undefined,
            attachments: attachments.map((f) => ({
                id: uuid(), name: f.name, type: 'file' as const,
                url: '#', size: f.size, mimeType: f.type,
            })),
            createdBy: user?.id || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status,
            allowLateSubmission: allowLate,
            maxFileSize: parseInt(maxFileSize) || 50,
            allowedFormats: allowedFormats.split(',').map((f) => f.trim()).filter(Boolean),
            submissionCount: 0,
            gradedCount: 0,
            rubric: rubric.length > 0 ? rubric : undefined,
        };
        addAssignment(assignment);
        navigate(`/class/${classId}`);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><BackIcon /></IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 400, color: '#202124' }}>Create Assignment</Typography>
                    <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>{cls?.name}</Typography>
                </Box>
                <Button variant="outlined" sx={{ mr: 1, textTransform: 'none' }} onClick={() => handleSave('draft')} startIcon={<SaveIcon />}>
                    Save as Draft
                </Button>
                <Button variant="contained" sx={{ textTransform: 'none', bgcolor: '#1967d2' }} onClick={() => handleSave('published')} startIcon={<PublishIcon />}>
                    Publish
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Main Form */}
                <Box>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
                                sx={{ mb: 2 }} placeholder="Assignment title" required />

                            {/* Description with basic rich text styling */}
                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mb: 0.5 }}>Description</Typography>
                            <TextField multiline minRows={4} maxRows={12} fullWidth value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the assignment goals, requirements, and expectations..."
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }} />

                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mb: 0.5 }}>Instructions (optional)</Typography>
                            <TextField multiline minRows={2} maxRows={6} fullWidth value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Submission instructions, formatting guidelines..."
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }} />

                            {/* Attachments */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Attachments</Typography>
                                <Button component="label" size="small" startIcon={<AttachIcon />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                                    Add file
                                    <input type="file" hidden multiple onChange={handleAttach} />
                                </Button>
                            </Box>
                            {attachments.map((f, i) => (
                                <Chip key={i} label={f.name} size="small" onDelete={() => setAttachments(attachments.filter((_, j) => j !== i))}
                                    sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Rubric Builder */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>📝 Grading Rubric</Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={addRubricItem}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                                    Add criterion
                                </Button>
                            </Box>

                            {rubric.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #e0e0e0', borderRadius: 1 }}>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.875rem', mb: 1 }}>No rubric criteria yet</Typography>
                                    <Button size="small" onClick={addRubricItem} startIcon={<AddIcon />}
                                        sx={{ textTransform: 'none' }}>
                                        Add your first criterion
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    {rubric.map((r, i) => (
                                        <Paper key={r.id} variant="outlined" sx={{ p: 2, mb: 1.5, border: '1px solid #e0e0e0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: '#e8f0fe', color: '#1967d2', width: 28, height: 28, fontSize: '0.75rem' }}>
                                                    {i + 1}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <TextField size="small" label="Criterion" fullWidth value={r.title}
                                                        onChange={(e) => updateRubric(r.id, 'title', e.target.value)}
                                                        sx={{ mb: 1 }} />
                                                    <TextField size="small" label="Description" fullWidth value={r.description}
                                                        onChange={(e) => updateRubric(r.id, 'description', e.target.value)}
                                                        multiline />
                                                </Box>
                                                <TextField size="small" label="Points" type="number" value={r.maxPoints}
                                                    onChange={(e) => updateRubric(r.id, 'maxPoints', parseInt(e.target.value) || 0)}
                                                    sx={{ width: 80 }} />
                                                <IconButton size="small" onClick={() => removeRubric(r.id)}><DeleteIcon sx={{ fontSize: 18, color: '#d93025' }} /></IconButton>
                                            </Box>
                                        </Paper>
                                    ))}
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Total Rubric Points</Typography>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: totalRubricPoints === parseInt(points) ? '#1e8e3e' : '#d93025' }}>
                                            {totalRubricPoints} / {points} pts
                                            {totalRubricPoints !== parseInt(points) && ' (mismatch)'}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Sidebar Settings */}
                <Box>
                    <Card sx={{ position: 'sticky', top: 80 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', mb: 2 }}>⚙️ Settings</Typography>

                            <TextField label="Points" type="number" fullWidth size="small" value={points}
                                onChange={(e) => setPoints(e.target.value)} sx={{ mb: 2 }} />

                            <TextField label="Due Date" type="date" fullWidth size="small" value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />

                            <TextField label="Due Time" type="time" fullWidth size="small" value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />

                            <TextField label="Topic" fullWidth size="small" value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Trees, Sorting..." sx={{ mb: 2 }} />

                            <Divider sx={{ my: 2 }} />
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 1 }}>Submission Settings</Typography>

                            <TextField label="Max file size (MB)" type="number" fullWidth size="small" value={maxFileSize}
                                onChange={(e) => setMaxFileSize(e.target.value)} sx={{ mb: 2 }} />

                            <TextField label="Allowed formats" fullWidth size="small" value={allowedFormats}
                                onChange={(e) => setAllowedFormats(e.target.value)}
                                helperText="Comma-separated, e.g. .zip,.pdf,.py"
                                sx={{ mb: 2 }} />

                            <FormControlLabel
                                control={<Switch checked={allowLate} onChange={(e) => setAllowLate(e.target.checked)} size="small" />}
                                label={<Typography sx={{ fontSize: '0.8125rem' }}>Allow late submissions</Typography>}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
