import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import authService from '../../services/api/auth.service';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      await authService.forgotPassword({ email });
      setSuccess('If an account exists with this email, you will receive password reset instructions.');
      setEmail(''); // Clear the form
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset instructions. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} role="form" noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              error={!!error}
              inputProps={{ 'data-testid': 'email-input' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 