import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as DownloadIcon,
  PlayArrow as PlayIcon,
  HelpOutline as HintIcon,
  Extension as PuzzleIcon,
  Videocam as VideoIcon,
  Link as LinkIcon,
  BugReport as BugIcon,
  InsertDriveFile as ReportIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';

import './ChallengePage.css';

export default function ChallengePage() {
  const [activeHintIdx, setActiveHintIdx] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const starterCode = `// Exploit Script for Google XSS Level 1\nfunction exploit(url) {\n    const payload = "<script>alert(1)</script>";\n    return url + "?query=" + encodeURIComponent(payload);\n}\n\nconsole.log(exploit("https://xss-game.appspot.com/level1/frame"));`;
  const [codeEditorVal, setCodeEditorVal] = useState(starterCode);

  const handleAlert = (btnName) => {
    alert(`u pushed this button: ${btnName}`);
  };

  const handleHintClick = (hintIndex, hintName) => {
    setActiveHintIdx(activeHintIdx === hintIndex ? null : hintIndex);
    handleAlert(hintName);
  };

  const hintsList = [
    'Look at the URL query parameter and notice how it gets printed directly onto the page.',
    'The server does not perform HTML escaping or neutralization on the query string.',
    'Try typing a simple HTML tag like <b>test</b> and if it formats, write a script block: <script>alert(1)</script>'
  ];

  return (
    <Box className="challenge-page-container">
      <Box className="challenge-main-card" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
        {/* Two column grid layout where the left column represents the main challenge page */}
        <Box className="challenge-grid">
          
          {/* Left Column (Main Challenge metadata, description and instructions) */}
          <Box className="challenge-left-col">
            
            {/* Header / Info Section inside Left Column */}
            <Box>
              <Box style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                <Typography variant="h3" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Google XSS Game
                </Typography>
                <Box style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge-outline web">Web</span>
                  <span className="badge-outline offensive">Offensive</span>
                </Box>
              </Box>
              
              <Box style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '8px' }}>
                <Typography variant="body1" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem' }}>
                  50 pts
                </Typography>
                <Typography variant="body1" style={{ color: 'var(--success-main)', fontWeight: 800, fontSize: '1.05rem' }}>
                  Easy
                </Typography>
              </Box>
            </Box>

            {/* Description Block */}
            <Box>
              <Typography variant="body1" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem' }}>
                This challenge features six levels of a simulated web application containing real-world vulnerabilities. Your mission is to find a way to inject a malicious script into the page. The level is complete when you successfully execute the JavaScript function alert() within the application's context.
              </Typography>
            </Box>

            {/* Target Link */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LinkIcon style={{ color: 'var(--primary-main)', fontSize: 20 }} />
              <Typography
                variant="body1"
                component="a"
                href="#"
                onClick={(e) => { e.preventDefault(); handleAlert('Link click: xss-game.appspot.com/level1'); }}
                style={{ color: 'var(--primary-main)', fontWeight: 800, textDecoration: 'none', fontSize: '0.92rem' }}
              >
                xss-game.appspot.com/level1
              </Typography>
            </Box>

            <Divider style={{ background: 'var(--divider)' }} />

            {/* Task Checklist (Aligned with bullet formatting) */}
            <Box>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>
                Task Checklist
              </Typography>
              <Box component="ul" className="challenge-list">
                <Box component="li" className="challenge-list-item">
                  Analyze how query inputs reflect on the target webpage.
                </Box>
                <Box component="li" className="challenge-list-item">
                  Inject a working JavaScript block utilizing script tags.
                </Box>
                <Box component="li" className="challenge-list-item">
                  Successfully trigger the browser pop-up using alert(1).
                </Box>
              </Box>
            </Box>

            <Divider style={{ background: 'var(--divider)' }} />

            {/* Script writer / code editor */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                Code Editor / Exploit Writer
              </Typography>
              <Paper style={{ border: '1px solid var(--divider)', borderRadius: '12px', overflow: 'hidden' }}>
                <Editor
                  height="160px"
                  language="javascript"
                  theme="vs-dark"
                  value={codeEditorVal}
                  onChange={(val) => setCodeEditorVal(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    scrollBeyondLastLine: false,
                    fontFamily: 'monospace'
                  }}
                />
                <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.1)' }}>
                  <Button size="small" variant="outlined" onClick={() => { setCodeEditorVal(starterCode); handleAlert('Reset Editor'); }} style={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    Reset
                  </Button>
                  <Button size="small" variant="contained" startIcon={<PlayIcon />} onClick={() => handleAlert('Run Script')} style={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: 'var(--primary-main)' }}>
                    Run Script
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Right Column (Actions, Hints, and Solutions - All Centered Altogether) */}
          <Box className="challenge-right-col">
            
            {/* Download Icon + Launch IDE button aligned horizontally on a single row */}
            <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', maxWidth: '380px' }}>
              <IconButton 
                onClick={() => handleAlert('Download resources / task files')} 
                style={{ 
                  border: '1.5px solid var(--divider)', 
                  borderRadius: '12px', 
                  padding: '12px', 
                  color: 'var(--text-primary)',
                  height: '48px',
                  width: '48px'
                }}
                title="Download Challenge Files"
              >
                <DownloadIcon />
              </IconButton>
              
              <Button
                variant="outlined"
                className="dashed-btn"
                fullWidth
                startIcon={<LaunchIcon />}
                onClick={() => handleAlert('Launch Instant / online ide')}
                style={{ height: '48px' }}
              >
                Launch Instant / online ide
              </Button>
            </Box>

            <Box className="wireframe-divider" />

            {/* Hints section */}
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '380px' }}>
              <Typography 
                variant="subtitle2" 
                style={{ 
                  fontWeight: 800, 
                  color: 'var(--text-secondary)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em', 
                  fontSize: '0.75rem', 
                  marginBottom: '12px',
                  textAlign: 'center'
                }}
              >
                Hints
              </Typography>
              <Box className="hints-container" style={{ justifyContent: 'center' }}>
                <Button variant="contained" className="hint-button" onClick={() => handleHintClick(0, 'Hint 1')}>
                  Hint 1
                </Button>
                <Button variant="contained" className="hint-button" onClick={() => handleHintClick(1, 'Hint 2')}>
                  Hint 2
                </Button>
                <Button variant="contained" className="hint-button" onClick={() => handleHintClick(2, 'Hint 3')}>
                  Hint 3
                </Button>
              </Box>

              {activeHintIdx !== null && (
                <Paper style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.2)', marginTop: '16px', width: '100%', textAlign: 'left' }}>
                  <Typography variant="caption" style={{ color: 'var(--text-primary)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    💡 HINT {activeHintIdx + 1}:
                  </Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                    {hintsList[activeHintIdx]}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Box className="wireframe-divider" />

            {/* Solution section */}
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '380px', paddingBottom: '12px' }}>
              <Typography 
                variant="subtitle2" 
                style={{ 
                  fontWeight: 800, 
                  color: 'var(--text-secondary)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em', 
                  fontSize: '0.75rem', 
                  marginBottom: '12px',
                  textAlign: 'center'
                }}
              >
                Solution
              </Typography>
              <Box className="solution-container" style={{ justifyContent: 'center', gap: '1.5rem', padding: '8px' }}>
                <IconButton
                  className="solution-icon-btn"
                  onClick={() => handleAlert('Walkthrough Video Solution')}
                  title="Watch Video Walkthrough"
                  style={{ width: '60px', height: '60px' }}
                >
                  <VideoIcon style={{ fontSize: 28 }} />
                </IconButton>
                <IconButton
                  className="solution-icon-btn"
                  onClick={() => { setIsReportOpen(true); handleAlert('View Walkthrough Report document'); }}
                  title="Read Vulnerability Disclosure Report"
                  style={{ width: '60px', height: '60px' }}
                >
                  <PuzzleIcon style={{ fontSize: 28 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Vulnerability report document Modal Popup */}
      <Dialog
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            border: '1px solid var(--divider)',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider)', padding: '16px 24px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BugIcon style={{ color: 'var(--danger-main)', fontSize: '1.5rem' }} />
            <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
              Vulnerability Disclosure Document
            </Typography>
          </Box>
          <IconButton onClick={() => setIsReportOpen(false)}>
            <CloseIcon style={{ color: 'var(--text-primary)' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          <Box className="report-paper-doc">
            <Typography variant="h6" style={{ fontWeight: 800, marginBottom: '14px', fontFamily: '"Outfit", sans-serif' }}>
              XSS Reflected Vulnerability in FourOrFour Search Page
            </Typography>
            
            <Box style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Chip size="small" label="Severity: Medium" color="warning" style={{ fontWeight: 800 }} />
              <Chip size="small" label="Status: Draft" style={{ fontWeight: 800 }} />
            </Box>

            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Weakness Classification
            </Typography>
            <Typography variant="body2" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '14px' }}>
              CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')
            </Typography>

            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Description Summary
            </Typography>
            <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '14px' }}>
              The query parameter is reflected directly into the HTML body without validation or sanitization, letting users run arbitrary JavaScript inside the frame.
            </Typography>

            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Steps to Reproduce
            </Typography>
            <Box component="ol" style={{ paddingLeft: '20px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box component="li" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Navigate to http://xss-game.appspot.com/level1/frame
              </Box>
              <Box component="li" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Input payload: &lt;script&gt;alert(1)&lt;/script&gt; in the search field.
              </Box>
              <Box component="li" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Click the search button and observe the browser popup alert.
              </Box>
            </Box>

            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              References
            </Typography>
            <Box component="ul" style={{ paddingLeft: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box component="li" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                OWASP A03:2021-Injection
              </Box>
              <Box component="li" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                CWE-79: Reflected Cross-Site Scripting
              </Box>
            </Box>

            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Attachments
            </Typography>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '8px',
                  border: '1px solid var(--divider)'
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ReportIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
                  <Typography style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>xss_poc_exploit.js</Typography>
                </Box>
                <IconButton size="small" onClick={() => handleAlert('Download: xss_poc_exploit.js')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '8px',
                  border: '1px solid var(--divider)'
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ReportIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
                  <Typography style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>network_capture.pcap</Typography>
                </Box>
                <IconButton size="small" onClick={() => handleAlert('Download: network_capture.pcap')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
