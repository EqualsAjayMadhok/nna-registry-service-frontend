import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../../pages/auth/ForgotPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
jest.mock('../../../services/api/auth.service');

const renderForgotPassword = () => {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    renderForgotPassword();
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });

  it('validates empty email', async () => {
    renderForgotPassword();
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });
  });

  it('validates invalid email format', async () => {
    renderForgotPassword();
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('handles successful password reset request', async () => {
    const mockForgotPassword = jest.spyOn(authService, 'forgotPassword').mockResolvedValueOnce();
    
    renderForgotPassword();
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
    });
    
    expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(emailInput).toHaveValue(''); // Form should be cleared
  });

  it('handles failed password reset request', async () => {
    const errorMessage = 'Failed to send reset instructions';
    const mockForgotPassword = jest.spyOn(authService, 'forgotPassword').mockRejectedValueOnce(new Error(errorMessage));
    
    renderForgotPassword();
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    const mockForgotPassword = jest.spyOn(authService, 'forgotPassword').mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    renderForgotPassword();
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
}); 