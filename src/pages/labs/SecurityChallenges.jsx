import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import DownloadIcon from '@mui/icons-material/GetApp';
import SecurityIcon from '@mui/icons-material/Security';
import BugIcon from '@mui/icons-material/BugReport';
import LockIcon from '@mui/icons-material/Lock';
import FileOpenIcon from '@mui/icons-material/InsertDriveFile';
import './SecurityChallenges.css';

export default function SecurityChallenges() {
  // XSS Challenge State
  const [xssQuery, setXssQuery] = useState('');
  const [reflectedHtml, setReflectedHtml] = useState('');
  const [xssLoading, setXssLoading] = useState(false);

  // SQLi Challenge State
  const [sqliUsername, setSqliUsername] = useState('');
  const [sqliPassword, setSqliPassword] = useState('');
  const [sqliResponse, setSqliResponse] = useState('');
  const [sqliLoading, setSqliLoading] = useState(false);

  // BAC Challenge State
  const [bacFileId, setBacFileId] = useState('1');

  // XSS Handler
  const handleXssSearch = async (e) => {
    e.preventDefault();
    setXssLoading(true);
    try {
      const res = await fetch(`/challenges/search?q=${encodeURIComponent(xssQuery)}`);
      if (res.ok) {
        const data = await res.json();
        // Crucially, render the returned query string directly into the DOM
        setReflectedHtml(data.query || '');
      } else {
        setReflectedHtml('Failed to fetch search results.');
      }
    } catch (err) {
      console.error(err);
      setReflectedHtml('Error fetching from /challenges/search');
    } finally {
      setXssLoading(false);
    }
  };

  // SQLi Handler
  const handleSqliLogin = async (e) => {
    e.preventDefault();
    setSqliLoading(true);
    setSqliResponse('');
    try {
      const res = await fetch('/challenges/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: sqliUsername,
          password: sqliPassword,
        }),
      });
      const data = await res.json();
      setSqliResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setSqliResponse('Error: Failed to perform login request.');
    } finally {
      setSqliLoading(false);
    }
  };

  // Quick Payloads helper
  const loadXssPayload = (payload) => {
    setXssQuery(payload);
  };

  const loadSqliPayload = (u, p) => {
    setSqliUsername(u);
    setSqliPassword(p);
  };

  return (
    <Box className="security-challenges-container">
      <Grid container spacing={4}>
        {/* Left Column - XSS and SQLi */}
        <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* XSS Challenge Section */}
          <Paper className="challenge-card glass-panel" elevation={0}>
            <Box className="challenge-card-header">
              <SecurityIcon className="challenge-icon text-yellow" />
              <Typography variant="h5" className="challenge-title">
                Reflected XSS Challenge (Easy)
              </Typography>
            </Box>
            
            <Typography variant="body2" className="challenge-desc">
              Input a search query. The server returns your search input in JSON, and the application renders it using <code>dangerouslySetInnerHTML</code> to simulate cross-site scripting flaws.
            </Typography>

            <form onSubmit={handleXssSearch} className="challenge-form">
              <TextField
                fullWidth
                variant="outlined"
                label="Search Products"
                placeholder="e.g. laptop, phone..."
                value={xssQuery}
                onChange={(e) => setXssQuery(e.target.value)}
                className="challenge-input"
                InputProps={{
                  startAdornment: <SearchIcon className="input-adornment-icon" />,
                }}
              />
              <Button
                type="submit"
                variant="contained"
                className="challenge-btn search-btn"
                disabled={xssLoading}
              >
                {xssLoading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
              </Button>
            </form>

            <Box className="payload-quick-load">
              <Typography variant="caption" className="quick-load-label">Quick Payloads:</Typography>
              <Button size="small" variant="outlined" onClick={() => loadXssPayload('<u>Interactive Test</u>')}>Underline</Button>
              <Button size="small" variant="outlined" className="danger-payload-btn" onClick={() => loadXssPayload("<img src=x onerror=alert('Reflected_XSS_Exploited!')>")}>Alert Box</Button>
            </Box>

            {reflectedHtml && (
              <Box className="xss-result-container">
                <Typography variant="subtitle2" className="result-label">
                  Reflected Output in DOM:
                </Typography>
                <div 
                  className="reflected-output"
                  dangerouslySetInnerHTML={{ __html: reflectedHtml }}
                />
              </Box>
            )}
          </Paper>

          {/* SQLi Challenge Section */}
          <Paper className="challenge-card glass-panel" elevation={0}>
            <Box className="challenge-card-header">
              <BugIcon className="challenge-icon text-red" />
              <Typography variant="h5" className="challenge-title">
                SQL Injection Challenge (Medium)
              </Typography>
            </Box>

            <Typography variant="body2" className="challenge-desc">
              Log in to the security challenges portal. The backend concatenates your input directly into a raw SQL query string. Bypass authentication or leak secret credentials.
            </Typography>

            <form onSubmit={handleSqliLogin} className="challenge-form-vertical">
              <TextField
                fullWidth
                variant="outlined"
                label="Username"
                value={sqliUsername}
                onChange={(e) => setSqliUsername(e.target.value)}
                className="challenge-input"
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type="text"
                value={sqliPassword}
                onChange={(e) => setSqliPassword(e.target.value)}
                className="challenge-input"
              />
              <Button
                type="submit"
                variant="contained"
                className="challenge-btn login-btn"
                disabled={sqliLoading}
                startIcon={<LoginIcon />}
              >
                {sqliLoading ? <CircularProgress size={20} color="inherit" /> : 'Authenticate'}
              </Button>
            </form>

            <Box className="payload-quick-load">
              <Typography variant="caption" className="quick-load-label">Quick Payloads:</Typography>
              <Button size="small" variant="outlined" className="danger-payload-btn" onClick={() => loadSqliPayload("admin' --", "any_password")}>Admin Bypass</Button>
              <Button size="small" variant="outlined" className="danger-payload-btn" onClick={() => loadSqliPayload("' OR '1'='1", "' OR '1'='1")}>Or 1=1</Button>
            </Box>

            {sqliResponse && (
              <Box className="sqli-result-container">
                <Typography variant="subtitle2" className="result-label">
                  Raw JSON Response from Server:
                </Typography>
                <pre className="json-terminal">
                  {sqliResponse}
                </pre>
              </Box>
            )}
          </Paper>

        </Grid>

        {/* Right Column - BAC/IDOR */}
        <Grid item xs={12} md={6}>
          
          {/* BAC Challenge Section */}
          <Paper className="challenge-card glass-panel" elevation={0} style={{ height: '100%' }}>
            <Box className="challenge-card-header">
              <LockIcon className="challenge-icon text-cyan" />
              <Typography variant="h5" className="challenge-title">
                Broken Access Control Challenge (Hard)
              </Typography>
            </Box>

            <Typography variant="body2" className="challenge-desc">
              You are currently authenticated as the guest user. Under standard authorization rules, you have permission to view and download public files.
            </Typography>

            <Box className="bac-info-banner">
              <Typography variant="body1">
                🔓 <strong>Access Level:</strong> Standard Guest
              </Typography>
              <Typography variant="body2" style={{ opacity: 0.8, marginTop: '4px' }}>
                You have permission to access public files (e.g. File ID: <strong>1</strong>).
              </Typography>
            </Box>

            <Divider style={{ margin: '24px 0', borderColor: 'var(--divider)' }} />

            <Box className="bac-exploit-box">
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Download Asset File
              </Typography>
              
              <Box className="file-preview-card">
                <FileOpenIcon style={{ fontSize: 40, color: 'var(--primary-main)' }} />
                <Box>
                  <Typography variant="subtitle2" style={{ fontWeight: 800 }}>Public_Guide.pdf</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>File ID: 1 | Publicly Accessible</Typography>
                </Box>
              </Box>

              <Box style={{ marginTop: '20px' }}>
                <a
                  href="/challenges/files/1"
                  download
                  className="ac-btn-link"
                >
                  <DownloadIcon fontSize="small" /> Download Public Guide
                </a>
              </Box>

              <Box className="bac-tip-box">
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  💡 Training Hint:
                </Typography>
                <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
                  The download link targets <code>/challenges/files/1</code>. A clever analyst can modify the ID parameter in the URL or intercept the request to retrieve file ID <strong>2</strong> (Confidential Merger Plans).
                </Typography>
              </Box>

              <Divider style={{ margin: '24px 0', borderColor: 'var(--divider)' }} />

              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Direct HTTP Request Manipulator
              </Typography>
              
              <Box className="http-manipulator">
                <span className="http-method">GET</span>
                <span className="http-path">/challenges/files/</span>
                <input
                  type="text"
                  value={bacFileId}
                  onChange={(e) => setBacFileId(e.target.value)}
                  className="http-input-id"
                  placeholder="ID"
                />
                <Button 
                  variant="contained" 
                  size="small"
                  className="http-send-btn"
                  onClick={() => {
                    window.open(`/challenges/files/${bacFileId}`, '_blank');
                  }}
                >
                  Send Request
                </Button>
              </Box>
            </Box>
          </Paper>

        </Grid>
      </Grid>
    </Box>
  );
}
