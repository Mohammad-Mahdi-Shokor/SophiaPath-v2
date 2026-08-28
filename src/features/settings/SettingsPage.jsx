import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Switch, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  ListItemIcon, 
  Divider,
  Button,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  CloudUpload as CloudIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon,
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
  Brush as BrushIcon,
  VolumeUp as VolumeIcon,
  TextFields as TextIcon,
  TouchApp as CursorIcon,
  Wallpaper as WallpaperIcon,
  AutoAwesome as AutoAwesomeIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';


const SettingsPage = () => {
  const { themeMode, setThemeMode } = useTheme();
  const { user, deleteAccount, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState(true);

  // Email change dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password change dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Snackbar feedback states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleEmailChangeSubmit = async () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setEmailError('Email address is required');
      return;
    }
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    try {
      const res = await fetch('/users/me/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail: trimmedEmail })
      });
      if (res.ok) {
        setEmailDialogOpen(false);
        setSnackbarMessage('Email address updated successfully!');
        setSnackbarOpen(true);
        refreshUser();
        setNewEmail('');
        setEmailError('');
      } else {
        const err = await res.json();
        setEmailError(err.message || 'Failed to update email');
      }
    } catch (e) {
      setEmailError('Network error. Failed to update email.');
    }
  };

  const handlePasswordChangeSubmit = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm password does not match new password');
      return;
    }
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    try {
      const res = await fetch('/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) {
        setPasswordDialogOpen(false);
        setSnackbarMessage('Password updated successfully!');
        setSnackbarOpen(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      } else {
        const err = await res.json();
        setPasswordError(err.message || 'Failed to update password');
      }
    } catch (e) {
      setPasswordError('Network error. Failed to update password.');
    }
  };

  const isTouchOrMobileDevice = useMediaQuery('(pointer: coarse), (max-width: 899px)');
  const isSmallScreen = useMediaQuery('(max-width: 899px)');
  const [showAllThemes, setShowAllThemes] = useState(false);

  const [logoGradient, setLogoGradient] = useState(() => {
    return localStorage.getItem('sophiapath_logo_style') === 'gradient';
  });
  const [customCursor, setCustomCursor] = useState(() => {
    return localStorage.getItem('sophiapath_custom_cursor') || 'default';
  });

  const [fontPreference, setFontPreference] = useState(() => {
    return localStorage.getItem('sophiapath_font_preference') || 'default';
  });
  const [globalBg, setGlobalBg] = useState(() => {
    return localStorage.getItem('sophiapath_global_bg') === 'true';
  });
  const [bgStyle, setBgStyle] = useState(() => {
    return localStorage.getItem('sophiapath_bg_style') || 'constellation';
  });

  const handleGlobalBgToggle = (e) => {
    const checked = e.target.checked;
    setGlobalBg(checked);
    localStorage.setItem('sophiapath_global_bg', checked ? 'true' : 'false');
    window.dispatchEvent(new Event('sophiapath_global_bg_changed'));
  };

  const handleBgStyleChange = (e) => {
    const value = e.target.value;
    setBgStyle(value);
    localStorage.setItem('sophiapath_bg_style', value);
    window.dispatchEvent(new Event('sophiapath_bg_style_changed'));
  };

  const handleLogoStyleChange = (e) => {
    const isGradient = e.target.checked;
    setLogoGradient(isGradient);
    localStorage.setItem('sophiapath_logo_style', isGradient ? 'gradient' : 'split');
    window.dispatchEvent(new Event('logo_style_changed'));
  };

  const handleCursorChange = (cursorId) => {
    setCustomCursor(cursorId);
    localStorage.setItem('sophiapath_custom_cursor', cursorId);
    window.dispatchEvent(new Event('custom_cursor_changed'));
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    setFontPreference(font);
    localStorage.setItem('sophiapath_font_preference', font);
    localStorage.setItem('sophiapath_dyslexic_font', font === 'dyslexic' ? 'true' : 'false');
    window.dispatchEvent(new Event('dyslexic_font_changed'));
  };



  const cursors = [
    { id: 'default', name: 'Classic', char: '🖱️' },
    { id: 'rounded', name: 'Rounded', char: '⚪' },
    { id: 'minimal', name: 'Minimal', char: '📐' },
    { id: 'bold', name: 'Bold', char: '◻️' },
    { id: 'glass', name: 'Glass', char: '✨' },
    { id: 'neon', name: 'Neon', char: '💠' },
    { id: 'pixel', name: 'Pixel', char: '🟪' },
    { id: 'futuristic', name: 'Futuristic', char: '🛸' },
    { id: 'crystal', name: 'Crystal', char: '💎' },
    { id: 'contrast', name: 'High Contrast', char: '♿' },
  ];

  const themes = [
    { id: 'light', name: 'Default Light', bg: '#FCFDFF', border: '#E9EDF5', text: '#2D2D4D', dot: '#3D5CFF' },
    { id: 'dark', name: 'Default Dark', bg: '#161632', border: 'rgba(255,255,255,0.08)', text: '#FFFFFF', dot: '#3D5CFF' },
    { id: 'sepia', name: 'Warm Sepia', bg: '#FDF6E3', border: '#EFE6CE', text: '#5C3E21', dot: '#856404' },
    { id: 'lava', name: 'Volcanic Lava', bg: '#1c0a0a', border: 'rgba(255,69,0,0.2)', text: '#ffc83b', dot: '#ff4500' },
    { id: 'ocean', name: 'Deep Ocean', bg: '#0f3057', border: 'rgba(0,188,212,0.2)', text: '#e0f7fa', dot: '#00bcd4' },
    { id: 'forest', name: 'Emerald Forest', bg: '#0c2617', border: 'rgba(16,185,129,0.2)', text: '#e2f3eb', dot: '#10b981' },
    { id: 'amber', name: 'Solarized Amber', bg: '#002b36', border: 'rgba(181,137,0,0.2)', text: '#fdf6e3', dot: '#b58900' },
    { id: 'dracula', name: 'Dracula Vampire', bg: '#1e1f29', border: 'rgba(255,121,198,0.2)', text: '#f8f8f2', dot: '#ff79c6' },
    { id: 'amethyst', name: 'Royal Amethyst', bg: '#29153a', border: 'rgba(212,175,55,0.2)', text: '#fae8ff', dot: '#d4af37' },
    { id: 'nordic', name: 'Nordic Ice', bg: '#3b4252', border: 'rgba(136,192,208,0.2)', text: '#eceff4', dot: '#88c0d0' },
    { id: 'mint', name: 'Frosted Mint', bg: '#f4fef9', border: '#00a86b33', text: '#0f3d2a', dot: '#00a86b' },
    { id: 'lavender', name: 'Soft Lavender', bg: '#fdfaff', border: '#7c3aed33', text: '#2e1065', dot: '#7c3aed' },
    { id: 'peach', name: 'Peach Cream', bg: '#fffefc', border: '#ea580c33', text: '#431407', dot: '#ea580c' },
    { id: 'rose', name: 'Rose Gold', bg: '#fffafb', border: '#db277733', text: '#500724', dot: '#db2777' },
    { id: 'clay', name: 'Clay Slate', bg: '#fafafa', border: '#4b556333', text: '#111827', dot: '#4b5563' },
    { id: 'kitty', name: 'Hello Kitty', bg: '#ffebf0', border: '#ff6b8b33', text: '#4a1525', dot: '#ff6b8b' },
    { id: 'midnight', name: 'Midnight Gold', bg: '#101726', border: '#fbc02d33', text: '#ffffff', dot: '#fbc02d' },
  ];

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      deleteAccount();
    }
  };


  return (
    <Box className="settings-page">
      <Container maxWidth="md">
        <Box className="settings-sections">
           <section style={{ opacity: !user ? 0.35 : 1 }}>
            <Typography variant="overline" className="settings-section-label">
              Account {!user && "(Sign in to access)"}
            </Typography>
            <Paper className="settings-card glass-panel" elevation={0} style={{ pointerEvents: !user ? 'none' : 'auto' }}>
              <List disablePadding>
                <ListItemButton 
                  className="settings-row interactive" 
                  disabled={!user}
                  onClick={() => {
                    setNewEmail(user?.email || '');
                    setEmailError('');
                    setEmailDialogOpen(true);
                  }}
                >
                  <ListItemIcon className="settings-row-icon">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography className="settings-row-title">Email Address</Typography>}
                    secondary={user?.email || 'N/A'}
                  />
                  <ChevronRightIcon className="settings-chevron" />
                </ListItemButton>
                <Divider />
                <ListItemButton 
                  className="settings-row interactive" 
                  disabled={!user}
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordDialogOpen(true);
                  }}
                >
                  <ListItemIcon className="settings-row-icon">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <VpnKeyIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography className="settings-row-title">Password</Typography>}
                    secondary="Click to change your password"
                  />
                  <ChevronRightIcon className="settings-chevron" />
                </ListItemButton>
              </List>
            </Paper>
          </section>

          <section>
            <Typography variant="overline" className="settings-section-label">
              Preferences
            </Typography>
            <Paper className="settings-card glass-panel" elevation={0}>
              <List disablePadding>
                <ListItem className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', padding: '20px 24px' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PaletteIcon className="settings-primary-icon" />
                    <ListItemText 
                      primary={<Typography className="settings-row-title">App Theme Preset</Typography>}
                      secondary="Customize the visual colors and appearance of the application"
                    />
                  </Box>
                  {(() => {
                    const INITIAL_THEME_COUNT = 6;
                    const displayedThemes = (isSmallScreen && !showAllThemes) 
                      ? themes.slice(0, INITIAL_THEME_COUNT) 
                      : themes;

                    return (
                      <>
                        <Box style={{ 
                          display: 'grid', 
                          gridTemplateColumns: isSmallScreen ? 'repeat(auto-fill, minmax(88px, 1fr))' : 'repeat(auto-fit, minmax(130px, 1fr))', 
                          gap: isSmallScreen ? '8px' : '12px', 
                          marginTop: '8px', 
                          width: '100%' 
                        }}>
                          {displayedThemes.map((t) => (
                            <Box
                              key={t.id}
                              onClick={() => setThemeMode(t.id)}
                              style={{
                                cursor: 'pointer',
                                padding: isSmallScreen ? '10px 6px' : '16px 12px',
                                borderRadius: isSmallScreen ? '12px' : '16px',
                                background: t.bg,
                                border: themeMode === t.id ? `2px solid ${t.dot}` : '1.5px solid var(--divider)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: isSmallScreen ? '4px' : '8px',
                                transition: 'all 0.2s ease',
                                textAlign: 'center'
                              }}
                            >
                              <Box style={{ width: isSmallScreen ? '14px' : '20px', height: isSmallScreen ? '14px' : '20px', borderRadius: '50%', background: t.dot, border: isSmallScreen ? '1.5px solid #fff' : '2.5px solid #fff'}} />
                              <Typography style={{ fontSize: isSmallScreen ? '0.68rem' : '0.8rem', fontWeight: 800, color: t.text, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {t.name}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        {isSmallScreen && (
                          <Button
                            onClick={() => setShowAllThemes(!showAllThemes)}
                            variant="text"
                            size="small"
                            endIcon={showAllThemes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            style={{
                              marginTop: '10px',
                              alignSelf: 'center',
                              borderRadius: '12px',
                              color: 'var(--primary-main)',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              textTransform: 'none'
                            }}
                          >
                            {showAllThemes ? 'View Less' : `View More (${themes.length - INITIAL_THEME_COUNT} themes)`}
                          </Button>
                        )}
                      </>
                    );
                  })()}

                </ListItem>
                <Divider />
                <ListItem className="settings-row">
                  <ListItemIcon className="settings-row-icon">
                    <BrushIcon className="settings-primary-icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography className="settings-row-title">Logo Smooth Gradient</Typography>}
                    secondary="Use a mixed blend gradient instead of a hard split-hue color logo"
                  />
                  <Switch checked={logoGradient} onChange={handleLogoStyleChange} color="primary" />
                </ListItem>
                {!isTouchOrMobileDevice && (
                  <>
                    <Divider />
                    <ListItem className="settings-row settings-pointer-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', padding: '20px 24px' }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CursorIcon className="settings-primary-icon" />
                        <ListItemText 
                          primary={<Typography className="settings-row-title">Custom Pointer Styles</Typography>}
                          secondary="Select an interactive cursor pointer for your philosophical journey"
                        />
                      </Box>
                      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginTop: '4px', width: '100%' }}>
                        {cursors.map((c) => (
                          <Box
                            key={c.id}
                            onClick={() => handleCursorChange(c.id)}
                            style={{
                              cursor: 'pointer',
                              padding: '12px 8px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: customCursor === c.id ? `2px solid var(--primary-main)` : '1.5px solid var(--divider)',

                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '1.4rem' }}>{c.char}</span>
                            <Typography style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </ListItem>
                  </>
                )}
                <Divider />
                <ListItem className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ListItemIcon className="settings-row-icon" style={{ minWidth: '40px' }}>
                      <TextIcon className="settings-primary-icon" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography className="settings-row-title">Active Font Family</Typography>}
                      secondary="Select user interface typeface to customize reading layouts"
                    />
                  </div>
                  <FormControl size="small" style={{ minWidth: isSmallScreen ? '110px' : '160px', maxWidth: isSmallScreen ? '140px' : '220px' }}>
                    <Select
                      value={fontPreference}
                      onChange={handleFontChange}
                      MenuProps={{ disableRestoreFocus: true }}
                      sx={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        fieldset: { borderColor: 'var(--divider)' },
                        '&:hover fieldset': { borderColor: 'var(--primary-main) !important' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary-main) !important' }}}
                    >
                      <MenuItem value="default">Outfit / Poppins (Theme)</MenuItem>
                      <MenuItem value="sans">Inter (Modern Sans)</MenuItem>
                      <MenuItem value="serif">Playfair Display (Serif Reading)</MenuItem>
                      <MenuItem value="monospace">Fira Code (Monospace Tech)</MenuItem>
                      <MenuItem value="dyslexic">Dyslexic-Friendly</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                <Divider />
                <ListItem className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ListItemIcon className="settings-row-icon" style={{ minWidth: '40px' }}>
                      <WallpaperIcon className="settings-primary-icon" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography className="settings-row-title">Global Background Animation</Typography>}
                      secondary="Add active abstract animations to the website backdrop"
                    />
                  </div>
                  <Switch checked={globalBg} onChange={handleGlobalBgToggle} color="primary" />
                </ListItem>
                {globalBg && (
                  <>
                    <Divider />
                    <ListItem className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <ListItemIcon className="settings-row-icon" style={{ minWidth: '40px' }}>
                          <AutoAwesomeIcon className="settings-primary-icon" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={<Typography className="settings-row-title">Backdrop Animation Style</Typography>}
                          secondary="Choose an animation style for the global website background"
                        />
                      </div>
                      <FormControl size="small" style={{ minWidth: isSmallScreen ? '110px' : '200px', maxWidth: isSmallScreen ? '140px' : '240px' }}>
                        <Select
                          value={bgStyle}
                          onChange={handleBgStyleChange}
                          MenuProps={{ disableRestoreFocus: true }}
                          sx={{
                            color: 'var(--text-primary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '10px',
                            fieldset: { borderColor: 'var(--divider)' },
                            '&:hover fieldset': { borderColor: 'var(--primary-main) !important' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--primary-main) !important' }}}
                        >
                          <MenuItem value="constellation">1. Constellation Network</MenuItem>
                          <MenuItem value="circuit">2. Circuit</MenuItem>
                          <MenuItem value="aurora">3. Aurora Waves</MenuItem>
                          <MenuItem value="grid">4. 3D Mesh Grid</MenuItem>
                          <MenuItem value="matrix">5. Matrix Code Rain</MenuItem>
                          <MenuItem value="vortex">6. Cosmic Vortex</MenuItem>
                          <MenuItem value="warp">7. Learning Warp</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItem>
                  </>
                )}
                <Divider />
                <ListItem className="settings-row">
                  <ListItemIcon className="settings-row-icon">
                    <NotificationsIcon className="settings-primary-icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography className="settings-row-title">Push Notifications</Typography>}
                    secondary="Get alerts about your learning progress"
                  />
                  <Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} color="primary" />
                </ListItem>
              </List>
            </Paper>
          </section>

          <section style={{ opacity: !user ? 0.35 : 1 }}>
            <Typography variant="overline" className="settings-section-label">
              Data & Privacy {!user && "(Sign in to access)"}
            </Typography>
            <Paper className="settings-card glass-panel" elevation={0} style={{ pointerEvents: !user ? 'none' : 'auto' }}>
              <List disablePadding>
                <ListItem 
                  className="settings-row interactive settings-danger-row"
                  onClick={!user ? undefined : handleDeleteAccount}
                  disabled={!user}
                >
                  <ListItemIcon className="settings-row-icon">
                    <DeleteIcon className="settings-danger-icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography className="settings-row-title settings-danger-text">Delete Account</Typography>}
                    secondary="Permanently remove your account and data"
                  />
                </ListItem>

              </List>
            </Paper>
          </section>
        </Box>

        <Box className="settings-footer">
          <Typography variant="caption" className="settings-footer-copy">
            SophiaPath Web v1.0.0 • Built with ❤️ for Learners
          </Typography>
        </Box>
      </Container>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)}
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            border: '1px solid var(--divider)',
            color: 'var(--text-primary)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle style={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Change Email Address
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>
            Please enter your new email address below.
          </DialogContentText>
          {emailError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{emailError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="New Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            InputProps={{
              style: { color: 'var(--text-primary)' },
              sx: {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }
            }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setEmailDialogOpen(false)} sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 800 }}>
            Cancel
          </Button>
          <Button onClick={handleEmailChangeSubmit} variant="contained" sx={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            border: '1px solid var(--divider)',
            color: 'var(--text-primary)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle style={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Change Password
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>
            To update your password, please confirm your current password and specify a new one.
          </DialogContentText>
          {passwordError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{passwordError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            InputProps={{
              style: { color: 'var(--text-primary)' },
              sx: {
                mb: 1.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            InputProps={{
              style: { color: 'var(--text-primary)' },
              sx: {
                mb: 1.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            InputProps={{
              style: { color: 'var(--text-primary)' },
              sx: {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }
            }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 800 }}>
            Cancel
          </Button>
          <Button onClick={handlePasswordChangeSubmit} variant="contained" sx={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: 3 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
