import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../../pages/auth/ForgotPassword';
import authService from '../../../services/api/auth.service';

// Mock the auth service
jest.mock('../../../services/api/auth.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.forgotPassword as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderForgotPassword = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('renders forgot password form', () => {
    renderForgotPassword();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderForgotPassword();
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Please enter your email address');
    });
  });

  it('shows validation error when submitting invalid email', async () => {
    const user = userEvent.setup();
    renderForgotPassword();
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Please enter a valid email address');
    });
  });

  it('successfully sends password reset email', async () => {
    const user = userEvent.setup();
    const mockResponse = { 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    };
    (authService.forgotPassword as jest.Mock).mockImplementation((email: string) => {
      expect(email).toBe('test@example.com');
      return Promise.resolve(mockResponse);
    });

    renderForgotPassword();
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('If an account exists with this email, you will receive password reset instructions.');
    });
  });

  it('shows error when password reset request fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to send password reset email';
    (authService.forgotPassword as jest.Mock).mockImplementation((email: string) => {
      expect(email).toBe('test@example.com');
      return Promise.reject(new Error(errorMessage));
    });

    renderForgotPassword();
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(errorMessage);
    });
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    (authService.forgotPassword as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    renderForgotPassword();
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
}); 