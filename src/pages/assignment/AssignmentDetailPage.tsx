// ============================================
// Assignment Detail Page - View & Submit
// ============================================
import { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
    Divider,
    IconButton,
    LinearProgress,
    Tooltip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    CheckCircle as CheckIcon,
    Schedule as ScheduleIcon,
    Error as ErrorIcon,
    Download as DownloadIcon,
    ArrowBack as BackIcon,
    Close as CloseIcon,
    Warning as WarningIcon,
    Flag as FlagIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { format, isPast } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Submission } from '../../types';

export default function AssignmentDetailPage() {
    const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>();
    const navigate = useNavigate();
    const { classes, assignments, submissions, addSubmission, updateSubmission, getSubmissionsByAssignment } = useAppStore();
    const { user } = useAuthStore();

    const cls = classes.find((c) => c.id === classId);
    const assignment = assignments.find((a) => a.id === assignmentId);
    const allSubmissions = assignmentId ? getSubmissionsByAssignment(assignmentId) : [];
    const mySubmission = user ? submissions.find((s) => s.assignmentId === assignmentId && s.studentId === user.id) : null;

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeValue, setGradeValue] = useState('');
    const [feedback, setFeedback] = useState('');
    const [viewTab, setViewTab] = useState(0); // 0 = Instructions, 1 = Student Work (faculty)
    const [fileErrors, setFileErrors] = useState<string[]>([]);

    if (!cls || !assignment) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#5f6368' }}>Assignment not found</Typography>
            </Box>
        );
    }

    const isDue = assignment.dueDate && isPast(new Date(assignment.dueDate));
    const isFaculty = user?.role === 'faculty';

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > assignment.maxFileSize * 1024 * 1024) {
            return `${file.name}: File too large (max ${assignment.maxFileSize}MB)`;
        }
        // Check file format
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (assignment.allowedFormats.length > 0 && !assignment.allowedFormats.includes(ext)) {
            return `${file.name}: Format not allowed (accepted: ${assignment.allowedFormats.join(', ')})`;
        }
        return null;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const errors: string[] = [];
        const validFiles: File[] = [];
        files.forEach((file) => {
            const error = validateFile(file);
            if (error) errors.push(error);
            else validFiles.push(file);
        });
        setFileErrors(errors);
        setUploadedFiles((prev) => [...prev, ...validFiles]);
    }, [assignment]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const errors: string[] = [];
        const validFiles: File[] = [];
        files.forEach((file) => {
            const error = validateFile(file);
            if (error) errors.push(error);
            else validFiles.push(file);
        });
        setFileErrors(errors);
        setUploadedFiles((prev) => [...prev, ...validFiles]);
    };

    const handleSubmit = async () => {
        if (uploadedFiles.length === 0) return;
        setUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise((r) => setTimeout(r, 100));
            setUploadProgress(i);
        }

        const now = new Date().toISOString();
        const isLate = assignment.dueDate ? isPast(new Date(assignment.dueDate)) : false;

        const submission: Submission = {
            id: uuidv4(),
            assignmentId: assignment.id,
            studentId: user?.id || '',
            studentName: user?.name || '',
            studentAvatar: '',
            files: uploadedFiles.map((f) => ({
                id: uuidv4(),
                name: f.name,
                size: f.size,
                type: f.type,
                url: '#',
                uploadedAt: now,
            })),
            submittedAt: now,
            status: isLate ? 'late' : 'submitted',
            isLate,
        };

        addSubmission(submission);
        setUploading(false);
        setUploadedFiles([]);
        setFileErrors([]);
    };

    const handleGrade = () => {
        if (!selectedSubmission || !gradeValue) return;
        updateSubmission(selectedSubmission.id, {
            grade: parseFloat(gradeValue),
            feedback,
            status: 'graded',
        });
        setGradeDialogOpen(false);
        setSelectedSubmission(null);
        setGradeValue('');
        setFeedback('');
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const submittedCount = allSubmissions.filter((s) => s.status !== 'missing').length;
    const lateCount = allSubmissions.filter((s) => s.isLate).length;
    const gradedCount = allSubmissions.filter((s) => s.status === 'graded').length;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {/* Header */}
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, color: '#5f6368' }}>
                    <BackIcon />
                </IconButton>
                <Typography sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                    {cls.name}
                </Typography>
            </Box>

            {/* Faculty tabs */}
            {isFaculty && (
                <Box sx={{ px: { xs: 2, sm: 3 }, borderBottom: '1px solid #e0e0e0' }}>
                    <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)}>
                        <Tab label="Instructions" />
                        <Tab label={`Student work (${allSubmissions.length})`} />
                    </Tabs>
                </Box>
            )}

            {/* ===== INSTRUCTIONS VIEW ===== */}
            {(viewTab === 0 || !isFaculty) && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        px: { xs: 2, sm: 3 },
                        pt: 3,
                        flexDirection: { xs: 'column', md: 'row' },
                    }}
                >
                    {/* Left - Assignment Details */}
                    <Box sx={{ flex: 1 }}>
                        {/* Title & Meta */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: cls.colorTheme,
                                    mr: 2,
                                }}
                            >
                                <AssignmentIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 400, fontSize: '2rem', color: cls.colorTheme }}
                                >
                                    {assignment.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                                        {cls.teacherName}
                                    </Typography>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                                        •
                                    </Typography>
                                    <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                                        {format(new Date(assignment.createdAt), 'MMM d, yyyy')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    {assignment.points && (
                                        <Typography sx={{ color: '#5f6368', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {assignment.points} points
                                        </Typography>
                                    )}
                                    {assignment.dueDate && (
                                        <Typography
                                            sx={{
                                                color: isDue ? '#d93025' : '#5f6368',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Due {format(new Date(assignment.dueDate), 'MMM d, yyyy, h:mm a')}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Description */}
                        <Typography sx={{ fontSize: '0.875rem', color: '#3c4043', lineHeight: 1.7, mb: 3, whiteSpace: 'pre-wrap' }}>
                            {assignment.description}
                        </Typography>

                        {assignment.instructions && (
                            <Typography sx={{ fontSize: '0.875rem', color: '#3c4043', lineHeight: 1.7, mb: 2 }}>
                                {assignment.instructions}
                            </Typography>
                        )}

                        {/* Attachments */}
                        {assignment.attachments.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                {assignment.attachments.map((att) => (
                                    <Card
                                        key={att.id}
                                        sx={{
                                            mb: 1,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#f1f3f4' },
                                        }}
                                    >
                                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: att.type === 'link' ? '#e8f0fe' : '#fce8e6',
                                                    mr: 2,
                                                }}
                                            >
                                                {att.type === 'link' ? (
                                                    <Typography sx={{ color: '#1967d2', fontSize: '0.75rem', fontWeight: 500 }}>LINK</Typography>
                                                ) : (
                                                    <FileIcon sx={{ color: '#d93025' }} />
                                                )}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{att.name}</Typography>
                                                {att.size && (
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                                        {formatFileSize(att.size)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}

                        {/* Submission Info */}
                        <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                            Allowed formats: {assignment.allowedFormats.join(', ')}
                        </Typography>
                        <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem', mt: 0.5 }}>
                            Max file size: {assignment.maxFileSize} MB
                        </Typography>
                    </Box>

                    {/* Right - Submission Panel (Student) */}
                    {user?.role === 'student' && (
                        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
                            <Card
                                sx={{
                                    position: { md: 'sticky' },
                                    top: { md: 80 },
                                    border: '1px solid #dadce0',
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>Your work</Typography>
                                        {mySubmission && (
                                            <Chip
                                                label={
                                                    mySubmission.status === 'submitted' ? 'Turned in' :
                                                        mySubmission.status === 'graded' ? 'Graded' :
                                                            mySubmission.status === 'late' ? 'Done late' :
                                                                mySubmission.status === 'missing' ? 'Missing' : mySubmission.status
                                                }
                                                size="small"
                                                sx={{
                                                    bgcolor:
                                                        mySubmission.status === 'submitted' ? '#e6f4ea' :
                                                            mySubmission.status === 'graded' ? '#e8f0fe' :
                                                                mySubmission.status === 'late' ? '#fce8e6' : '#f1f3f4',
                                                    color:
                                                        mySubmission.status === 'submitted' ? '#137333' :
                                                            mySubmission.status === 'graded' ? '#1967d2' :
                                                                mySubmission.status === 'late' ? '#c5221f' : '#5f6368',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Grade display */}
                                    {mySubmission?.grade !== undefined && (
                                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f6f9fe', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '2rem', fontWeight: 400, color: '#1967d2' }}>
                                                {mySubmission.grade}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.875rem', color: '#5f6368' }}>
                                                / {assignment.points}
                                            </Typography>
                                            {mySubmission.feedback && (
                                                <Typography sx={{ fontSize: '0.8125rem', color: '#3c4043', mt: 1, textAlign: 'left' }}>
                                                    {mySubmission.feedback}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {/* Already submitted files */}
                                    {mySubmission?.files && mySubmission.files.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            {mySubmission.files.map((file) => (
                                                <Paper
                                                    key={file.id}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <FileIcon sx={{ color: '#5f6368', mr: 1.5 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {file.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>
                                                            {formatFileSize(file.size)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Upload Area */}
                                    {(!mySubmission || mySubmission.status === 'missing') && (
                                        <>
                                            {/* Drag & Drop Zone */}
                                            <Box
                                                onDrop={handleDrop}
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                sx={{
                                                    border: `2px dashed ${dragOver ? '#1967d2' : '#dadce0'}`,
                                                    borderRadius: 1,
                                                    p: 3,
                                                    textAlign: 'center',
                                                    mb: 2,
                                                    bgcolor: dragOver ? '#e8f0fe' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                <UploadIcon sx={{ fontSize: 36, color: dragOver ? '#1967d2' : '#5f6368', mb: 1 }} />
                                                <Typography sx={{ fontSize: '0.8125rem', color: '#5f6368' }}>
                                                    Drag files here or click to upload
                                                </Typography>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    hidden
                                                    onChange={handleFileSelect}
                                                    accept={assignment.allowedFormats.join(',')}
                                                />
                                            </Box>

                                            {/* File Errors */}
                                            {fileErrors.length > 0 && (
                                                <Box sx={{ mb: 2 }}>
                                                    {fileErrors.map((err, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            <ErrorIcon sx={{ fontSize: 16, color: '#d93025', mr: 0.5 }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#d93025' }}>{err}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Uploaded Files List */}
                                            {uploadedFiles.map((file, index) => (
                                                <Paper
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <FileIcon sx={{ color: '#5f6368', mr: 1.5 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {file.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>
                                                            {formatFileSize(file.size)}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton size="small" onClick={() => removeFile(index)}>
                                                        <CloseIcon fontSize="small" sx={{ color: '#5f6368' }} />
                                                    </IconButton>
                                                </Paper>
                                            ))}

                                            {/* Upload Progress */}
                                            {uploading && (
                                                <Box sx={{ mb: 2 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={uploadProgress}
                                                        sx={{ height: 4, borderRadius: 2 }}
                                                    />
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.5, textAlign: 'center' }}>
                                                        Uploading... {uploadProgress}%
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleSubmit}
                                                disabled={uploadedFiles.length === 0 || uploading}
                                                sx={{
                                                    bgcolor: '#1967d2',
                                                    '&:hover': { bgcolor: '#174ea6' },
                                                    py: 1,
                                                    mt: 1,
                                                }}
                                            >
                                                {uploading ? 'Submitting...' : 'Turn in'}
                                            </Button>

                                            {isDue && !assignment.allowLateSubmission && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, px: 0.5 }}>
                                                    <WarningIcon sx={{ fontSize: 16, color: '#d93025', mr: 0.5 }} />
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#d93025' }}>
                                                        This assignment is past due and doesn't allow late submissions
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}

                                    {/* Submission timestamp */}
                                    {mySubmission?.submittedAt && (
                                        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                                            <ScheduleIcon sx={{ fontSize: 14, color: '#5f6368', mr: 0.5 }} />
                                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                                Submitted {format(new Date(mySubmission.submittedAt), 'MMM d, h:mm a')}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* Right - Stats Panel (Faculty) */}
                    {isFaculty && viewTab === 0 && (
                        <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
                            <Card sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                                <CardContent>
                                    <Box
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => setViewTab(1)}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 400, color: '#1967d2' }}>
                                                    {submittedCount}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Turned in</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 400, color: '#5f6368' }}>
                                                    {allSubmissions.filter((s) => s.status === 'missing').length}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Assigned</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 400, color: '#1e8e3e' }}>
                                                    {gradedCount}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>Graded</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Box>
            )}

            {/* ===== STUDENT WORK VIEW (Faculty) ===== */}
            {isFaculty && viewTab === 1 && (
                <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
                    {/* Stats Bar */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                        <Chip icon={<CheckIcon />} label={`${submittedCount} Submitted`} sx={{ bgcolor: '#e6f4ea', color: '#137333' }} />
                        <Chip icon={<ScheduleIcon />} label={`${lateCount} Late`} sx={{ bgcolor: '#fce8e6', color: '#c5221f' }} />
                        <Chip icon={<ErrorIcon />} label={`${allSubmissions.filter((s) => s.status === 'missing').length} Missing`} sx={{ bgcolor: '#f1f3f4', color: '#5f6368' }} />
                        <Chip icon={<CheckIcon />} label={`${gradedCount} Graded`} sx={{ bgcolor: '#e8f0fe', color: '#1967d2' }} />
                    </Box>

                    {/* Submissions List */}
                    <List sx={{ p: 0 }}>
                        {allSubmissions.map((sub) => (
                            <Card
                                key={sub.id}
                                sx={{ mb: 1.5, '&:hover': { boxShadow: '0 1px 3px rgba(60,64,67,.15)' } }}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: sub.status === 'submitted' ? '#1e8e3e' :
                                                    sub.status === 'late' ? '#e8710a' :
                                                        sub.status === 'graded' ? '#1967d2' :
                                                            sub.status === 'missing' ? '#d93025' : '#5f6368',
                                                mr: 2,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {sub.studentName.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{sub.studentName}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                                <Chip
                                                    label={
                                                        sub.status === 'submitted' ? 'Turned in' :
                                                            sub.status === 'late' ? 'Late' :
                                                                sub.status === 'graded' ? `${sub.grade}/${assignment.points}` :
                                                                    sub.status === 'missing' ? 'Missing' : sub.status
                                                    }
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.6875rem',
                                                        bgcolor:
                                                            sub.status === 'submitted' ? '#e6f4ea' :
                                                                sub.status === 'late' ? '#fef7e0' :
                                                                    sub.status === 'graded' ? '#e8f0fe' :
                                                                        sub.status === 'missing' ? '#fce8e6' : '#f1f3f4',
                                                        color:
                                                            sub.status === 'submitted' ? '#137333' :
                                                                sub.status === 'late' ? '#9a6700' :
                                                                    sub.status === 'graded' ? '#1967d2' :
                                                                        sub.status === 'missing' ? '#c5221f' : '#5f6368',
                                                    }}
                                                />
                                                {sub.submittedAt && (
                                                    <Typography sx={{ fontSize: '0.6875rem', color: '#5f6368' }}>
                                                        {format(new Date(sub.submittedAt), 'MMM d, h:mm a')}
                                                    </Typography>
                                                )}
                                                {sub.plagiarismScore !== undefined && sub.plagiarismScore > 30 && (
                                                    <Tooltip title={`Plagiarism similarity: ${sub.plagiarismScore}%`}>
                                                        <Chip
                                                            icon={<FlagIcon sx={{ fontSize: '14px !important' }} />}
                                                            label={`${sub.plagiarismScore}%`}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.6875rem',
                                                                bgcolor: sub.plagiarismScore > 50 ? '#fce8e6' : '#fef7e0',
                                                                color: sub.plagiarismScore > 50 ? '#c5221f' : '#9a6700',
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            {/* AI Summary on hover */}
                                            {sub.aiSummary && (
                                                <Tooltip title={sub.aiSummary} arrow placement="bottom-start">
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.5, cursor: 'help' }}>
                                                        📝 {sub.aiSummary.substring(0, 60)}...
                                                    </Typography>
                                                </Tooltip>
                                            )}
                                        </Box>

                                        {/* Actions */}
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {sub.files.length > 0 && (
                                                <Tooltip title="Download">
                                                    <IconButton size="small">
                                                        <DownloadIcon fontSize="small" sx={{ color: '#5f6368' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {sub.status !== 'missing' && sub.status !== 'graded' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSelectedSubmission(sub);
                                                        setGradeDialogOpen(true);
                                                    }}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.25,
                                                        borderColor: '#dadce0',
                                                        color: '#1967d2',
                                                    }}
                                                >
                                                    Grade
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>

                    {allSubmissions.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AssignmentIcon sx={{ fontSize: 64, color: '#dadce0', mb: 2 }} />
                            <Typography sx={{ color: '#5f6368' }}>No submissions yet</Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Grade Dialog */}
            <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Grade - {selectedSubmission?.studentName}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2, alignItems: 'center' }}>
                        <TextField
                            label="Grade"
                            type="number"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value)}
                            sx={{ width: 120 }}
                            inputProps={{ min: 0, max: assignment.points || 100 }}
                        />
                        <Typography sx={{ color: '#5f6368' }}>/ {assignment.points || 100}</Typography>
                    </Box>
                    <TextField
                        fullWidth
                        label="Private comment (optional)"
                        multiline
                        minRows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setGradeDialogOpen(false)} sx={{ color: '#5f6368' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleGrade}
                        disabled={!gradeValue}
                        sx={{ bgcolor: '#1967d2' }}
                    >
                        Return
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
