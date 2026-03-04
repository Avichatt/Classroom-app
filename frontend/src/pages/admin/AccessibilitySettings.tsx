// ============================================
// Accessibility & Language Settings
// ============================================
import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Select, MenuItem, FormControl,
    InputLabel, Switch, FormControlLabel, Button, Divider, Alert, Chip,
} from '@mui/material';
import { Save as SaveIcon, DarkMode as DarkIcon, LightMode as LightIcon } from '@mui/icons-material';

const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin', 'Arabic', 'Japanese', 'Portuguese', 'Korean'];
const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
    'Asia/Kolkata', 'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

export default function AccessibilitySettings() {
    const [language, setLanguage] = useState('English');
    const [timezone, setTimezone] = useState('America/New_York');
    const [nightMode, setNightMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully!</Alert>}

            {/* Language */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🌍 Language & Region</Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Institution Language</InputLabel>
                            <Select value={language} label="Institution Language" onChange={(e) => { setLanguage(e.target.value); setSaved(false); }}>
                                {languages.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Timezone</InputLabel>
                            <Select value={timezone} label="Timezone" onChange={(e) => { setTimezone(e.target.value); setSaved(false); }}>
                                {timezones.map((tz) => <MenuItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 1 }}>
                        All dates and times in the system will display in the selected timezone.
                    </Typography>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>🎨 Appearance</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Card sx={{
                            flex: 1, p: 2, cursor: 'pointer', textAlign: 'center',
                            border: !nightMode ? '2px solid #1967d2' : '1px solid #e0e0e0',
                            bgcolor: !nightMode ? '#e8f0fe' : '#fff',
                        }} onClick={() => { setNightMode(false); setSaved(false); }}>
                            <LightIcon sx={{ fontSize: 32, color: !nightMode ? '#1967d2' : '#9aa0a6', mb: 0.5 }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: !nightMode ? 500 : 400 }}>Light Mode</Typography>
                        </Card>
                        <Card sx={{
                            flex: 1, p: 2, cursor: 'pointer', textAlign: 'center',
                            border: nightMode ? '2px solid #8ab4f8' : '1px solid #e0e0e0',
                            bgcolor: nightMode ? '#1a1a2e' : '#fff',
                        }} onClick={() => { setNightMode(true); setSaved(false); }}>
                            <DarkIcon sx={{ fontSize: 32, color: nightMode ? '#8ab4f8' : '#9aa0a6', mb: 0.5 }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: nightMode ? 500 : 400, color: nightMode ? '#fff' : 'inherit' }}>Night Mode</Typography>
                        </Card>
                    </Box>
                </CardContent>
            </Card>

            {/* Accessibility Options */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>♿ Accessibility</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={highContrast} onChange={(e) => { setHighContrast(e.target.checked); setSaved(false); }} />}
                            label={<Box>
                                <Typography sx={{ fontSize: '0.875rem' }}>High Contrast Mode</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Increases contrast for better visual clarity</Typography>
                            </Box>} />
                        <Divider />
                        <FormControlLabel
                            control={<Switch checked={largeText} onChange={(e) => { setLargeText(e.target.checked); setSaved(false); }} />}
                            label={<Box>
                                <Typography sx={{ fontSize: '0.875rem' }}>Large Text</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Increases base font size for readability</Typography>
                            </Box>} />
                        <Divider />
                        <FormControlLabel
                            control={<Switch checked={reduceMotion} onChange={(e) => { setReduceMotion(e.target.checked); setSaved(false); }} />}
                            label={<Box>
                                <Typography sx={{ fontSize: '0.875rem' }}>Reduce Motion</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#5f6368' }}>Minimizes animations for motion-sensitive users</Typography>
                            </Box>} />
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setSaved(true)} sx={{ textTransform: 'none', bgcolor: '#1967d2' }}>
                    Save Settings
                </Button>
            </Box>
        </Box>
    );
}
