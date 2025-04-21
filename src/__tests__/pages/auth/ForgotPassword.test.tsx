import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ForgotPassword from '../../../pages/auth/ForgotPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
vi.mock('../../../services/api/auth.service', () => ({
  default: {
    forgotPassword: vi.fn(),
  },
}));

const renderForgotPassword = () => {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    renderForgotPassword();
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });

  it('validates empty email', async () => {
    renderForgotPassword();
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Please enter your email address')).toBeInTheDocument();
  });

  it('validates invalid email format', async () => {
    renderForgotPassword();
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('handles successful password reset request', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValueOnce();
    
    renderForgotPassword();
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
    });
    
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(emailInput).toHaveValue(''); // Form should be cleared
  });

  it('handles failed password reset request', async () => {
    const errorMessage = 'Failed to send reset instructions';
    vi.mocked(authService.forgotPassword).mockRejectedValueOnce(new Error(errorMessage));
    
    renderForgotPassword();
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    vi.mocked(authService.forgotPassword).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderForgotPassword();
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
}); 