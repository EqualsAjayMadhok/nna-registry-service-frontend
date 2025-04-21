import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../../pages/auth/ResetPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
jest.mock('../../../services/api/auth.service');

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams('?token=test-token'), jest.fn()],
}));

const renderResetPassword = () => {
  return render(
    <BrowserRouter>
      <ResetPassword />
    </BrowserRouter>
  );
};

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form', () => {
    renderResetPassword();
    
    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderResetPassword();
    
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderResetPassword();
    
    const passwordInput = screen.getByLabelText('New Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password *');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error when password is too short', async () => {
    renderResetPassword();
    
    const passwordInput = screen.getByLabelText('New Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password *');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  it('successfully resets password and redirects to login', async () => {
    const mockResetPassword = jest.spyOn(authService, 'resetPassword').mockResolvedValueOnce({ 
      success: true,
      message: 'Password reset successful'
    });
    renderResetPassword();
    
    const passwordInput = screen.getByLabelText('New Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password *');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'test-token',
        password: 'newPassword123'
      });
      expect(screen.getByText('Your password has been reset successfully.')).toBeInTheDocument();
    });
  });

  it('shows error message on reset failure', async () => {
    const mockResetPassword = jest.spyOn(authService, 'resetPassword').mockRejectedValueOnce(new Error('Invalid or expired token'));
    renderResetPassword();
    
    const passwordInput = screen.getByLabelText('New Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password *');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'test-token',
        password: 'newPassword123'
      });
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });
  });
});
