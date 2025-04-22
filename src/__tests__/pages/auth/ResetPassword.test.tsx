import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../../pages/auth/ResetPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
const mockResetPassword = jest.fn();
jest.mock('../../../services/api/auth.service', () => ({
  __esModule: true,
  default: {
    resetPassword: (args: any) => mockResetPassword(args)
  }
}));

// Mock the useSearchParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams({ token: 'valid-token' })],
  useNavigate: () => jest.fn()
}));

const fillPasswordFields = (password: string) => {
  const passwordInput = screen.getByTestId('password-input').querySelector('input');
  const confirmPasswordInput = screen.getByTestId('confirm-password-input').querySelector('input');
  
  if (passwordInput && confirmPasswordInput) {
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, { target: { value: password } });
  }
};

const fillPasswordFieldsWithMismatch = (password: string, confirmPassword: string) => {
  const passwordInput = screen.getByTestId('password-input').querySelector('input');
  const confirmPasswordInput = screen.getByTestId('confirm-password-input').querySelector('input');
  
  if (passwordInput && confirmPasswordInput) {
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, { target: { value: confirmPassword } });
  }
};

describe('ResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-button')).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all fields');
    });
  });

  it('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    const form = screen.getByRole('form');
    fillPasswordFieldsWithMismatch('password123', 'password456');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error when password is too short', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    const form = screen.getByRole('form');
    fillPasswordFields('short');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters long');
    });
  });

  it('handles successful password reset', async () => {
    mockResetPassword.mockResolvedValueOnce({
      success: true,
      message: 'Password reset successful'
    });

    await fillPasswordFields('Password123!');
    await act(() => {
      fireEvent.submit(screen.getByRole('form'));
    });

    expect(mockResetPassword).toHaveBeenCalledWith({
      resetToken: 'valid-token',
      newPassword: 'Password123!'
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Password reset successful');
    });
  });

  it('handles failed password reset', async () => {
    mockResetPassword.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: 'Invalid reset token'
        }
      }
    });

    await fillPasswordFields('Password123!');
    await act(() => {
      fireEvent.submit(screen.getByRole('form'));
    });

    expect(mockResetPassword).toHaveBeenCalledWith({
      resetToken: 'invalid-token',
      newPassword: 'Password123!'
    });
  });

  it('shows loading state while submitting', async () => {
    let resolvePromise: (value: { success: boolean; message: string }) => void;
    const resetPromise = new Promise<{ success: boolean; message: string }>((resolve) => {
      resolvePromise = resolve;
    });

    mockResetPassword.mockImplementationOnce(() => resetPromise);

    await fillPasswordFields('Password123!');
    await act(() => {
      fireEvent.submit(screen.getByRole('form'));
    });

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await act(async () => {
      resolvePromise({ success: true, message: 'Password reset successful' });
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});


