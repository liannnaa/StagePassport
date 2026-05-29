import React from 'react';
import { Alert, TextInput } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../../features/auth/screens/AuthScreen';

const mockLogIn = jest.fn();
const mockSignUp = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    logIn: mockLogIn,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
  }),
}));

describe('AuthScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getInputs(screen: ReturnType<typeof render>) {
    return screen.UNSAFE_getAllByType(TextInput);
  }

  it('renders login mode by default', () => {
    const screen = render(<AuthScreen />);

    expect(screen.getByText('Stage Passport')).toBeTruthy();
    expect(screen.getByText('Log in to continue')).toBeTruthy();
    expect(screen.getByText('Forgot password?')).toBeTruthy();
    expect(screen.getAllByText('Log In')).toHaveLength(2);
  });

  it('lets a user sign up successfully', async () => {
    const screen = render(<AuthScreen />);

    fireEvent.press(screen.getByText('Sign Up'));

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');
    fireEvent.changeText(inputs[2], 'password1');

    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password1');
    });
  });

  it('blocks sign up when passwords do not match', async () => {
    const screen = render(<AuthScreen />);

    fireEvent.press(screen.getByText('Sign Up'));

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');
    fireEvent.changeText(inputs[2], 'password2');

    fireEvent.press(screen.getByText('Create Account'));

    expect(mockSignUp).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Passwords do not match',
      'Please confirm your password.'
    );
  });

  it('shows existing-email error when Firebase returns auth/email-already-in-use', async () => {
    mockSignUp.mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
      message: 'Firebase: Error (auth/email-already-in-use).',
    });

    const screen = render(<AuthScreen />);

    fireEvent.press(screen.getByText('Sign Up'));

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');
    fireEvent.changeText(inputs[2], 'password1');

    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Account already exists',
        'An account with this email already exists. Try logging in instead.'
      );
    });
  });

  it('lets a user log in successfully', async () => {
    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    await waitFor(() => {
      expect(mockLogIn).toHaveBeenCalledWith('test@example.com', 'password1');
    });
  });

  it('shows invalid login error for auth/invalid-credential', async () => {
    mockLogIn.mockRejectedValueOnce({
      code: 'auth/invalid-credential',
      message: 'Firebase: Error (auth/invalid-credential).',
    });

    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Invalid login',
        'The email or password is incorrect.'
      );
    });
  });

  it('blocks forgot password when email is invalid', () => {
    const screen = render(<AuthScreen />);

    fireEvent.press(screen.getByText('Forgot password?'));

    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Enter your email first',
      'Please enter a valid email address to reset your password.'
    );
  });

  it('sends reset password for a valid email and shows success message', async () => {
    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');

    fireEvent.press(screen.getByText('Forgot password?'));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Password reset sent',
      'Check your email for reset instructions. If you do not see it, check your spam or junk folder.'
    );
  });

  it('shows account not found error for auth/user-not-found', async () => {
    mockLogIn.mockRejectedValueOnce({
      code: 'auth/user-not-found',
      message: 'Firebase: Error (auth/user-not-found).',
    });

    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'missing@example.com');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Account not found',
        'No account was found for this email.'
      );
    });
  });

  it('shows incorrect password error for auth/wrong-password', async () => {
    mockLogIn.mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Firebase: Error (auth/wrong-password).',
    });

    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Incorrect password',
        'The password you entered is incorrect.'
      );
    });
  });

  it('shows generic authentication error for unknown login failure', async () => {
    mockLogIn.mockRejectedValueOnce(new Error('Something broke'));

    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Authentication failed',
        'Something broke'
      );
    });
  });

  it('blocks login when email is invalid', () => {
    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'not-an-email');
    fireEvent.changeText(inputs[1], 'password1');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    expect(mockLogIn).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid email',
      'Please enter a valid email address.'
    );
  });

  it('blocks login when password is invalid', () => {
    const screen = render(<AuthScreen />);

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'short');

    fireEvent.press(screen.getAllByText('Log In')[1]);

    expect(mockLogIn).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid password',
      'Password must be at least 8 characters.'
    );
  });
});