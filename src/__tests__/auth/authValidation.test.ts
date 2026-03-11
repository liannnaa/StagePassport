import {
  isValidEmail,
  validatePassword,
} from '../../features/auth/utils/authValidation';

describe('authValidation', () => {
  describe('isValidEmail', () => {
    it('accepts a valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('trims whitespace before validating', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
    });

    it('rejects an email with no @ symbol', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('rejects an email with no domain suffix', () => {
      expect(isValidEmail('test@example')).toBe(false);
    });

    it('rejects an empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts a password with at least 8 characters, a letter, and a number', () => {
      expect(validatePassword('password1')).toBeNull();
    });

    it('rejects a password shorter than 8 characters', () => {
      expect(validatePassword('abc123')).toBe(
        'Password must be at least 8 characters.'
      );
    });

    it('rejects a password with no letters', () => {
      expect(validatePassword('12345678')).toBe(
        'Password must include at least one letter.'
      );
    });

    it('rejects a password with no numbers', () => {
      expect(validatePassword('password')).toBe(
        'Password must include at least one number.'
      );
    });
  });
});