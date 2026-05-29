import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import {
  clearStoredSession,
  saveStoredSession,
} from './secureSession';

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await saveStoredSession({
    uid: result.user.uid,
    email: result.user.email,
  });

  return result.user;
}

export async function logInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await saveStoredSession({
    uid: result.user.uid,
    email: result.user.email,
  });

  return result.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
  await clearStoredSession();
}

export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}