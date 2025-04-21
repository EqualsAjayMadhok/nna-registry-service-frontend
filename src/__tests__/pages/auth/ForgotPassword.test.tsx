import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../../pages/auth/ForgotPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
jest.mock('../../../services/api/auth.service', () => ({
  __esModule: true,
  default: {
    forgotPassword: jest.fn()
  }
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when email is empty', async () => {
    renderComponent();
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });
  });

  it('shows validation error when email is invalid', async () => {
    renderComponent();
    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('handles successful password reset request', async () => {
    mockAuthService.forgotPassword.mockResolvedValue();
    
    renderComponent();
    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('If an account exists with this email, you will receive password reset instructions.')).toBeInTheDocument();
    });
    
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });

  it('handles failed password reset request', async () => {
    const errorMessage = 'Failed to send reset instructions. Please try again.';
    mockAuthService.forgotPassword.mockRejectedValue(new Error(errorMessage));
    
    renderComponent();
    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    mockAuthService.forgotPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent();
    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
}); 