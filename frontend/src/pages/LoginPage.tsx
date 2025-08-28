import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Default login credentials
  const DEFAULT_EMAIL = 'user@example.com';
  const DEFAULT_PASSWORD = 'password123';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(''); // Clear error when user types
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Check against default credentials
    if (formData.email === DEFAULT_EMAIL && formData.password === DEFAULT_PASSWORD) {
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        // Store login status (you can expand this with proper auth later)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        
        // Navigate to dashboard/upload page
        navigate('/upload');
      }, 1000);
    } else {
      setTimeout(() => {
        setError('Invalid credentials. Use user@example.com / password123');
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const fillDefaultCredentials = () => {
    setFormData({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    });
  };

  return (
    <div className="login-page">
      {/* Header */}
      <Box className="header-section">
        <Container maxWidth="lg">
          <Box py={3}>
            <Typography variant="h4" className="page-title">
              <LoginIcon sx={{ mr: 2, color: '#3b82f6' }} />
              Sign In to Resume Tracker
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card className="login-card" elevation={8}>
          <CardContent sx={{ p: 4 }}>
            {/* Welcome Section */}
            <Box textAlign="center" mb={4}>
              <Box className="login-icon-container" mb={2}>
                <Person sx={{ fontSize: 48, color: '#3b82f6' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary" mb={1}>
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your resume tracking dashboard
              </Typography>
            </Box>



            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" noValidate>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                className="login-input"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
                className="login-input"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleLogin}
                disabled={isLoading}
                className="login-button"
                sx={{ mb: 3, py: 1.5 }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Footer */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {/* Add signup navigation later */}}
                  sx={{ textTransform: 'none' }}
                >
                  Sign up here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
