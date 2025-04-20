import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state if available
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!emailOrUsername || !password) {
        setError('Please enter both email/username and password');
        setIsLoading(false);
        return;
      }
      
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      
      // Log the login attempt for debugging
      console.log('🔑 Login attempt with:', isEmail ? 'email' : 'username', emailOrUsername);
      
      // Add extra logging for debug purposes
      console.log(`Login details: ${emailOrUsername}, password length: ${password.length}`);
      
      await login(emailOrUsername, password);
      console.log('✅ Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Keep error handling simple
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err instanceof Error) {
        // If it's an Error object, use its message
        errorMessage = err.message;
        
        // Special case for common errors
        if (errorMessage.toLowerCase().includes('invalid') || 
            errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'Invalid username/email or password. Please try again.';
        }
      }
      
      // Handle object errors (like server response objects)
      if (errorMessage.includes('[object Object]')) {
        errorMessage = 'Login error. Please try again.';
      }
      
      // Add login instructions for better user experience
      const loginWithEmail = emailOrUsername.includes('@');
      if (!loginWithEmail) {
        errorMessage += " (Tip: You can also try logging in with your email address)";
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
            NNA Registry Service
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Log in to your account
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
              id="emailOrUsername"
              label="Email or Username"
              name="emailOrUsername"
              autoComplete="email username"
              autoFocus
              value={emailOrUsername}
              onChange={e => setEmailOrUsername(e.target.value)}
              placeholder="Enter your email or username"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
