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
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/sp-logo.png';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'Rather Not Say'});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const [logoStyle] = useState(() => localStorage.getItem('sophiapath_logo_style') || 'split');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      return setError('Age must be a valid positive number');
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register({
      ...registerData,
      avatar: ''
    });
    
    if (result.success) {
      localStorage.setItem('show_onboarding_tutorial', 'true');
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
            Create Account
          </Typography>
          <Typography variant="body1" className="auth-subtitle">
            Join SophiaPath and start your learning adventure
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
            label="Full Name"
            name="name"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
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
            label="Email Address"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" />
                </InputAdornment>
              )}}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
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
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" />
                </InputAdornment>
              )}}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1 }}>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              variant="outlined"
              value={formData.age}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              variant="outlined"
              value={formData.gender}
              onChange={handleChange}
              SelectProps={{
                native: true}}
              required
            >
              <option value="Rather Not Say">Rather Not Say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </TextField>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            className="auth-submit-btn"
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in instead
            </Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
