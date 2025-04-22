import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
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

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = searchParams.get('token');
      if (!token) {
        setError('Invalid reset token');
        setLoading(false);
        return;
      }

      const response = await authService.resetPassword({
        resetToken: token,
        newPassword: password
      });
      setSuccess('Password reset successful');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      setLoading(false);
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} role="form" sx={{ mt: 3 }} width="100%">
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} role="alert">
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} role="alert">
                {success}
              </Alert>
            )}
            <TextField
              data-testid="password-input"
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password *"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success !== ''}
            />
            <TextField
              data-testid="confirm-password-input"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password *"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success !== ''}
            />
            <Button
              data-testid="reset-password-button"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success !== ''}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 