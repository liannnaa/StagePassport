import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  logInWithEmail,
  logOut,
  signUpWithEmail,
  sendResetPassword,
} from '../services/authService';
import {
  clearStoredSession,
  saveStoredSession,
} from '../services/secureSession';

type AuthContextValue = {
  user: User | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        await saveStoredSession({
          uid: nextUser.uid,
          email: nextUser.email,
        });
      } else {
        await clearStoredSession();
      }

      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  async function handleSignUp(email: string, password: string) {
    await signUpWithEmail(email, password);
  }

  async function handleLogIn(email: string, password: string) {
    await logInWithEmail(email, password);
  }

  async function handleLogOut() {
    await logOut();
  }

  async function handleResetPassword(email: string) {
    await sendResetPassword(email);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isAuthenticated: Boolean(user),
      signUp: handleSignUp,
      logIn: handleLogIn,
      logOut: handleLogOut,
      resetPassword: handleResetPassword,
    }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}