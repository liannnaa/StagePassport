import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import AppTextInput from '../../../components/AppTextInput';
import { colors, radius, spacing } from '../../../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePassword } from '../utils/authValidation';

type AuthMode = 'login' | 'signup';

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }

  return null;
}

export default function AuthScreen() {
  const { logIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'signup';

  const subtitle = useMemo(() => {
    return isSignUp
      ? 'Create an account to save your stage passport'
      : 'Log in to continue';
  }, [isSignUp]);

  async function handleSubmit() {
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Invalid password', passwordError);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm your password.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isSignUp) {
        await signUp(normalizedEmail, password);
      } else {
        await logIn(normalizedEmail, password);
      }
    } catch (error) {
      const errorCode = getErrorCode(error);

      if (errorCode === 'auth/email-already-in-use') {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists. Try logging in instead.'
        );
      } else if (errorCode === 'auth/invalid-credential') {
        Alert.alert(
          'Invalid login',
          'The email or password is incorrect.'
        );
      } else if (errorCode === 'auth/user-not-found') {
        Alert.alert(
          'Account not found',
          'No account was found for this email.'
        );
      } else if (errorCode === 'auth/wrong-password') {
        Alert.alert(
          'Incorrect password',
          'The password you entered is incorrect.'
        );
      } else {
        const message =
          error instanceof Error ? error.message : 'Something went wrong.';
        Alert.alert('Authentication failed', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        'Enter your email first',
        'Please enter a valid email address to reset your password.'
      );
      return;
    }

    try {
      await resetPassword(normalizedEmail);
      Alert.alert(
        'Password reset sent',
        'Check your email for reset instructions. If you do not see it, check your spam or junk folder.'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Reset failed', message);
    }
  }

  return (
    <ScreenContainer>
      <AppScrollView>
        <View style={styles.hero}>
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.heroTitle}>Stage Passport</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.modeRow}>
          <ModeButton
            label="Log In"
            active={mode === 'login'}
            onPress={() => setMode('login')}
          />
          <ModeButton
            label="Sign Up"
            active={mode === 'signup'}
            onPress={() => setMode('signup')}
          />
        </View>

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isSignUp ? 'new-password' : 'password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
        />

        {isSignUp ? (
          <FormField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
        ) : null}

        {!isSignUp ? (
          <Pressable onPress={handleForgotPassword} style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Please wait...'
              : isSignUp
              ? 'Create Account'
              : 'Log In'}
          </Text>
        </Pressable>

      </AppScrollView>
    </ScreenContainer>
  );
}

type FormFieldProps = React.ComponentProps<typeof AppTextInput> & {
  label: string;
};

function FormField({ label, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <AppTextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.modeButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.modeButtonText,
          active && styles.modeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.lg,
    marginTop: spacing.xl*2,
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
    minHeight: 36,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
  },
  modeButtonPressed: {
    opacity: 0.85,
  },
  modeButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: colors.accentTextOnAccent,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  linkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.accentTextOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
});