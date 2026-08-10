import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = (firebaseConfigData as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfigData as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function getCleanAuthErrorMessage(err: any): string {
  if (!err) return 'An error occurred during authentication. Please try again.';

  const code: string = err?.code || err?.name || '';
  const message: string = typeof err === 'string' ? err : err?.message || '';

  // 1. Google sign-in unauthorized domain
  if (
    code === 'auth/unauthorized-domain' ||
    message.includes('auth/unauthorized-domain') ||
    message.includes('unauthorized-domain')
  ) {
    return 'Google Sign-In is not enabled for this website domain. Please sign in with Email & Password or create a new account.';
  }

  // 2. Wrong credentials / user not found / invalid password / invalid email
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email' ||
    message.includes('auth/invalid-credential') ||
    message.includes('auth/wrong-password') ||
    message.includes('auth/user-not-found') ||
    message.includes('auth/invalid-email')
  ) {
    return 'Incorrect email address or password. Please check your credentials and try again.';
  }

  // 3. Email already in use
  if (
    code === 'auth/email-already-in-use' ||
    message.includes('auth/email-already-in-use')
  ) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  // 4. Weak password
  if (
    code === 'auth/weak-password' ||
    message.includes('auth/weak-password')
  ) {
    return 'Password is too weak. Please enter at least 6 characters.';
  }

  // 5. Popup closed or cancelled
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    message.includes('popup-closed-by-user') ||
    message.includes('cancelled-popup-request')
  ) {
    return 'Google Sign-In window was closed. Please try again.';
  }

  // 6. Too many requests
  if (
    code === 'auth/too-many-requests' ||
    message.includes('too-many-requests')
  ) {
    return 'Too many failed login attempts. Please wait a few moments before trying again.';
  }

  // 7. Operation not allowed
  if (
    code === 'auth/operation-not-allowed' ||
    message.includes('operation-not-allowed')
  ) {
    return 'Email/Password sign-in is currently disabled. Please use an alternative sign-in method.';
  }

  // 8. General cleanup for any other error containing "Firebase" or technical codes
  let cleanMsg = message
    .replace(/^Firebase:\s*/gi, '')
    .replace(/Error\s*\([^)]*\)\.?/gi, '')
    .replace(/Firebase/gi, '')
    .trim();

  if (!cleanMsg || cleanMsg.length < 3) {
    return 'Authentication failed. Please verify your details and try again.';
  }

  return cleanMsg;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: Client offline or test doc unavailable.");
    }
  }
}
testConnection();
