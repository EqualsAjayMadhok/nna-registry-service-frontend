import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // More comprehensive validation
    if (!username || !email || !password) {
      setError('Please fill out all required fields');
      return;
    }
    
    // Username validation - at least 3 characters, no special chars except underscore
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password validation - at least 8 chars
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting registration with username:', username);
      
      // Register the user
      await register(username, email, password);
      console.log('✅ Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Registration failed:', err);
      
      // Keep error handling simple
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        // If it's an Error object, use its message
        errorMessage = err.message;
      }
      
      // Handle object errors (like server response objects)
      if (errorMessage.includes('[object Object]')) {
        errorMessage = 'Registration error. Please try with a different username or email.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 450,
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create an Account
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Register to access the NNA Registry Service
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;