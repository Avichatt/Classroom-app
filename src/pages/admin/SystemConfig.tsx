// ============================================
// System Configuration Panel
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, TextField, Switch, FormControlLabel,
    Button, Chip, Divider, Paper, Slider, Alert,
} from '@mui/material';
import { Save as SaveIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { defaultSystemConfig, SystemConfig as SysConfig } from '../../data/adminMockData';

export default function SystemConfig() {
    const [config, setConfig] = useState<SysConfig>({ ...defaultSystemConfig });
    const [saved, setSaved] = useState(false);

    const update = <K extends keyof SysConfig>(key: K, value: SysConfig[K]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => setSaved(true);
    const handleReset = () => { setConfig({ ...defaultSystemConfig }); setSaved(false); };

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            {saved && <Alert severity="success" sx={{ mb: 2 }}>Configuration saved successfully!</Alert>}

            {/* File Upload Settings */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📎 File Upload Settings</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField label="Allowed file formats" value={config.allowedFormats.join(', ')} fullWidth size="small"
                            onChange={(e) => update('allowedFormats', e.target.value.split(',').map((s) => s.trim()))}
                            helperText="Comma-separated file extensions (e.g. .pdf, .zip, .py)" />
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', mb: 1 }}>Max upload size: <strong>{config.maxUploadSizeMB} MB</strong></Typography>
                            <Slider value={config.maxUploadSizeMB} onChange={(_, v) => update('maxUploadSizeMB', v as number)}
                                min={5} max={200} step={5} marks={[{ value: 5, label: '5MB' }, { value: 50, label: '50MB' }, { value: 100, label: '100MB' }, { value: 200, label: '200MB' }]}
                                sx={{ color: '#1967d2', maxWidth: 500 }} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Grading & Submission Settings */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>📝 Grading & Submission</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', mb: 1 }}>Default late penalty: <strong>{config.defaultLatePenalty}%</strong></Typography>
                            <Slider value={config.defaultLatePenalty} onChange={(_, v) => update('defaultLatePenalty', v as number)}
                                min={0} max={50} step={5} marks={[{ value: 0, label: '0%' }, { value: 10, label: '10%' }, { value: 25, label: '25%' }, { value: 50, label: '50%' }]}
                                sx={{ color: '#e8710a', maxWidth: 500 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', mb: 1 }}>Reminder timing: <strong>{config.reminderTimingHours} hours</strong> before deadline</Typography>
                            <Slider value={config.reminderTimingHours} onChange={(_, v) => update('reminderTimingHours', v as number)}
                                min={1} max={48} step={1} marks={[{ value: 1, label: '1h' }, { value: 12, label: '12h' }, { value: 24, label: '24h' }, { value: 48, label: '48h' }]}
                                sx={{ color: '#a142f4', maxWidth: 500 }} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* AI & Plagiarism Settings */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🤖 AI & Plagiarism</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={config.llmSummaryEnabled} onChange={(e) => update('llmSummaryEnabled', e.target.checked)} />}
                            label={<Box>
                                <Typography sx={{ fontSize: '0.875rem' }}>LLM Summary Generation</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Auto-generate AI summaries for submitted assignments</Typography>
                            </Box>}
                        />
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', mb: 1 }}>Plagiarism similarity threshold: <strong>{config.plagiarismThreshold}%</strong></Typography>
                            <Slider value={config.plagiarismThreshold} onChange={(_, v) => update('plagiarismThreshold', v as number)}
                                min={10} max={80} step={5}
                                marks={[{ value: 10, label: '10%' }, { value: 30, label: '30%' }, { value: 50, label: '50%' }, { value: 80, label: '80%' }]}
                                sx={{ color: '#d93025', maxWidth: 500 }} />
                            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Submissions above this threshold will be flagged</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🔒 Security</Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <TextField label="Max login attempts" type="number" size="small" value={config.maxLoginAttempts}
                            onChange={(e) => update('maxLoginAttempts', parseInt(e.target.value) || 1)}
                            sx={{ width: 160 }} inputProps={{ min: 1, max: 20 }} />
                        <TextField label="Session timeout (min)" type="number" size="small" value={config.sessionTimeoutMinutes}
                            onChange={(e) => update('sessionTimeoutMinutes', parseInt(e.target.value) || 5)}
                            sx={{ width: 180 }} inputProps={{ min: 5, max: 480 }} />
                    </Box>
                </CardContent>
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button startIcon={<ResetIcon />} onClick={handleReset} sx={{ textTransform: 'none', color: '#5f6368' }}>Reset to Defaults</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ textTransform: 'none', bgcolor: '#1967d2' }}>Save Configuration</Button>
            </Box>
        </Box>
    );
}
