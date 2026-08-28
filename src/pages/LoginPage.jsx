import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/sp-logo.png';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [logoStyle] = useState(() => localStorage.getItem('sophiapath_logo_style') || 'split');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="sm" className="auth-container">
      <Paper className="auth-card glass-panel-strong" elevation={0}>
        <div className="auth-header">
          <div 
            className={`nav-brand-logo-container ${logoStyle === 'gradient' ? 'sp-logo-gradient' : ''}`}
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              overflow: 'hidden', 
              position: 'relative',
              marginBottom: '1rem',
              WebkitMaskImage: `url(${logoImg})`,
              maskImage: `url(${logoImg})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain'}}
          >
            <div className="nav-logo-left-half" />
            <div className="nav-logo-right-half" />
          </div>
          <Typography variant="h4" className="auth-title">
            Welcome Back
          </Typography>
          <Typography variant="body1" className="auth-subtitle">
            Sign in to continue your learning journey
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="auth-alert">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            fullWidth
            label="Username or Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" />
                </InputAdornment>
              )}}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )}}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            className="auth-submit-btn"
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one now
            </Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default LoginPage;
