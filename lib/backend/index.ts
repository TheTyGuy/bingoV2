import type { Backend } from './types';
import { localBackend } from './local';
import { firebaseBackend } from './firebase';

/** Firebase when configured via NEXT_PUBLIC_FIREBASE_* env vars, otherwise the local demo backend. */
export const backend: Backend = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? firebaseBackend : localBackend;
