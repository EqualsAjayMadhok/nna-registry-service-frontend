import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../../pages/auth/ResetPassword';
import authService from '../../../services/api/auth.service';
import { ResetPasswordRequest } from '../../../types/auth.types';

// Mock the auth service
jest.mock('../../../services/api/auth.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams({ token: 'test-token' }), jest.fn()],
}));

describe('ResetPassword Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authService.resetPassword as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderResetPassword = () => {
    return render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
  };

  it('renders reset password form', () => {
    renderResetPassword();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-button')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderResetPassword();
    
    const submitButton = screen.getByTestId('reset-password-button');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Please fill in all fields');
    });
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderResetPassword();
    
    const newPasswordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('reset-password-button');

    await user.type(newPasswordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error when password is too short', async () => {
    const user = userEvent.setup();
    renderResetPassword();
    
    const newPasswordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('reset-password-button');

    await user.type(newPasswordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Password must be at least 8 characters long');
    });
  });

  it('successfully resets password and redirects to login', async () => {
    const user = userEvent.setup();
    const mockResetResponse = { success: true, message: 'Your password has been reset successfully.' };
    (authService.resetPassword as jest.Mock).mockImplementation((request: ResetPasswordRequest) => {
      expect(request).toEqual({
        token: 'test-token',
        password: 'password123'
      });
      return Promise.resolve(mockResetResponse);
    });

    renderResetPassword();
    
    const newPasswordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('reset-password-button');

    await user.type(newPasswordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Your password has been reset successfully');
    });
  });

  it('shows error when reset fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid or expired token';
    (authService.resetPassword as jest.Mock).mockImplementation((request: ResetPasswordRequest) => {
      expect(request).toEqual({
        token: 'test-token',
        password: 'password123'
      });
      return Promise.reject(new Error(errorMessage));
    });

    renderResetPassword();
    
    const newPasswordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('reset-password-button');

    await user.type(newPasswordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(errorMessage);
    });
  });
});
