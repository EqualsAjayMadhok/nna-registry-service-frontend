import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../../pages/auth/ResetPassword';
import authService from '../../../services/api/auth.service';
import * as router from 'react-router-dom';

// Mock the authService
jest.mock('../../../services/api/auth.service');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams({ token: 'valid-token' })]
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

  it('shows validation error when submitting empty form', async () => {
    renderResetPassword();
    const submitButton = screen.getByTestId('reset-password-submit');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all fields');
    });
  });

  it('shows error when passwords do not match', async () => {
    renderResetPassword();
    const newPasswordInput = screen.getByTestId('new-password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');
    
    await userEvent.type(newPasswordInput, 'Password123!');
    await userEvent.type(confirmPasswordInput, 'DifferentPassword123!');
    
    const submitButton = screen.getByTestId('reset-password-submit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error when password is too short', async () => {
    renderResetPassword();
    const newPasswordInput = screen.getByTestId('new-password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');
    
    await userEvent.type(newPasswordInput, 'short');
    await userEvent.type(confirmPasswordInput, 'short');
    
    const submitButton = screen.getByTestId('reset-password-submit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters long');
    });
  });

  it('successfully resets password and redirects to login', async () => {
    mockAuthService.resetPassword.mockResolvedValueOnce({ success: true, message: 'Password reset successful' });
    
    renderResetPassword();
    const newPasswordInput = screen.getByTestId('new-password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');
    
    await userEvent.type(newPasswordInput, 'NewPassword123!');
    await userEvent.type(confirmPasswordInput, 'NewPassword123!');
    
    const submitButton = screen.getByTestId('reset-password-submit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error when reset fails', async () => {
    const errorMessage = 'Invalid or expired token';
    mockAuthService.resetPassword.mockRejectedValueOnce(new Error(errorMessage));
    
    renderResetPassword();
    const newPasswordInput = screen.getByTestId('new-password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');
    
    await userEvent.type(newPasswordInput, 'NewPassword123!');
    await userEvent.type(confirmPasswordInput, 'NewPassword123!');
    
    const submitButton = screen.getByTestId('reset-password-submit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });
});
