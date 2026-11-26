import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { Game, Player } from '../types';
import type { Backend } from './types';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore | null = null;
function firestore(): Firestore {
  if (!db) {
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  }
  return db;
}

let userPromise: Promise<User> | null = null;
/**
 * The signed-in (anonymous) player. Waits for Firebase to finish restoring any
 * saved sign-in before creating a new one, and makes sure the ID token is ready,
 * so the first database request goes out signed in.
 */
function currentUser(): Promise<User> {
  if (!userPromise) {
    firestore();
    const auth = getAuth();
    userPromise = (async () => {
      await auth.authStateReady();
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      await user.getIdToken();
      return user;
    })();
    userPromise.catch(() => {
      userPromise = null; // let the next call try again
    });
  }
  return userPromise;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isPermissionDenied = (e: unknown) => (e as { code?: string })?.code === 'permission-denied';

/**
 * Right after a phone signs in for the first time, the database can briefly
 * see its requests as signed-out and refuse them ("Missing or insufficient
 * permissions"). Retry those a few times before giving up.
 */
async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  await currentUser();
  const waits = [300, 700, 1500];
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (!isPermissionDenied(e) || attempt >= waits.length) throw e;
      await sleep(waits[attempt]);
      await getAuth().currentUser?.getIdToken(true);
    }
  }
}

/** A live listener that reconnects after an error instead of silently stopping. */
function resilientListener(subscribe: (onError: (e: unknown) => void) => () => void): () => void {
  let stop = () => {};
  let cancelled = false;
  let failures = 0;
  const start = () => {
    if (cancelled) return;
    stop = subscribe(() => {
      stop();
      failures++;
      setTimeout(start, Math.min(500 * 2 ** failures, 8000));
    });
  };
  currentUser().then(start, () => setTimeout(start, 2000));
  return () => {
    cancelled = true;
    stop();
  };
}

const gameRef = (code: string) => doc(firestore(), 'games', code);
const playersRef = (code: string) => collection(firestore(), 'games', code, 'players');
const sortPlayers = (ps: Player[]) => ps.sort((a, b) => a.joinedAt - b.joinedAt);

export const firebaseBackend: Backend = {
  mode: 'firebase',

  async getUserId() {
    return (await currentUser()).uid;
  },

  async createGame(game) {
    return withAuth(() => runTransaction(firestore(), async (tx) => {
      const snap = await tx.get(gameRef(game.code));
      if (snap.exists()) return false;
      tx.set(gameRef(game.code), game);
      return true;
    }));
  },

  async getGame(code) {
    const snap = await withAuth(() => getDoc(gameRef(code)));
    return snap.exists() ? (snap.data() as Game) : null;
  },

  async fetchGameDirect(code) {
    // A read-only transaction goes over a plain request, not the live-update
    // connection, so it still works when that connection has stalled.
    return withAuth(() =>
      runTransaction(firestore(), async (tx) => {
        const snap = await tx.get(gameRef(code));
        return snap.exists() ? (snap.data() as Game) : null;
      }),
    );
  },

  async updateGame(code, fn) {
    return withAuth(() =>
      runTransaction(firestore(), async (tx) => {
        const snap = await tx.get(gameRef(code));
        if (!snap.exists()) return null;
        const next = fn(snap.data() as Game);
        if (next) tx.set(gameRef(code), next);
        return next;
      }),
    );
  },

  watchGame(code, cb) {
    return resilientListener((onError) =>
      onSnapshot(gameRef(code), (snap) => cb(snap.exists() ? (snap.data() as Game) : null), onError),
    );
  },

  async getPlayers(code) {
    const snap = await withAuth(() => getDocs(playersRef(code)));
    return sortPlayers(snap.docs.map((d) => d.data() as Player));
  },

  async setPlayer(code, player) {
    await withAuth(() => setDoc(doc(playersRef(code), player.id), player));
  },

  async updatePlayer(code, id, patch) {
    await withAuth(() => updateDoc(doc(playersRef(code), id), patch));
  },

  async markSquare(code, id, index, promptId, on) {
    // Field-level array ops: atomic, and applied to the screen instantly (no round trip).
    await withAuth(() =>
      updateDoc(doc(playersRef(code), id), {
        marks: on ? arrayUnion(index) : arrayRemove(index),
        [`markedAt.${promptId}`]: on ? Date.now() : deleteField(),
      }),
    );
  },

  async removePlayer(code, id) {
    await withAuth(() => deleteDoc(doc(playersRef(code), id)));
  },

  watchPlayers(code, cb) {
    return resilientListener((onError) =>
      onSnapshot(playersRef(code), (snap) => cb(sortPlayers(snap.docs.map((d) => d.data() as Player))), onError),
    );
  },
};
