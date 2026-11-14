import { getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
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
function currentUser(): Promise<User> {
  if (!userPromise) {
    firestore();
    const auth = getAuth();
    userPromise = new Promise<User>((resolve, reject) => {
      const stop = onAuthStateChanged(auth, (user) => {
        if (user) {
          stop();
          resolve(user);
        }
      });
      // Anonymous sign-in: players get a stable id without making an account.
      if (!auth.currentUser) signInAnonymously(auth).catch(reject);
    });
  }
  return userPromise;
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
    await currentUser();
    return runTransaction(firestore(), async (tx) => {
      const snap = await tx.get(gameRef(game.code));
      if (snap.exists()) return false;
      tx.set(gameRef(game.code), game);
      return true;
    });
  },

  async getGame(code) {
    await currentUser();
    const snap = await getDoc(gameRef(code));
    return snap.exists() ? (snap.data() as Game) : null;
  },

  async updateGame(code, fn) {
    await currentUser();
    return runTransaction(firestore(), async (tx) => {
      const snap = await tx.get(gameRef(code));
      if (!snap.exists()) return null;
      const next = fn(snap.data() as Game);
      if (next) tx.set(gameRef(code), next);
      return next;
    });
  },

  watchGame(code, cb) {
    let stop = () => {};
    let cancelled = false;
    currentUser().then(() => {
      if (cancelled) return;
      stop = onSnapshot(gameRef(code), (snap) => cb(snap.exists() ? (snap.data() as Game) : null));
    });
    return () => {
      cancelled = true;
      stop();
    };
  },

  async getPlayers(code) {
    await currentUser();
    const snap = await getDocs(playersRef(code));
    return sortPlayers(snap.docs.map((d) => d.data() as Player));
  },

  async setPlayer(code, player) {
    await currentUser();
    await setDoc(doc(playersRef(code), player.id), player);
  },

  async updatePlayer(code, id, patch) {
    await currentUser();
    await updateDoc(doc(playersRef(code), id), patch);
  },

  async markSquare(code, id, index, promptId, on) {
    await currentUser();
    // Field-level array ops: atomic, and applied to the screen instantly (no round trip).
    await updateDoc(doc(playersRef(code), id), {
      marks: on ? arrayUnion(index) : arrayRemove(index),
      [`markedAt.${promptId}`]: on ? Date.now() : deleteField(),
    });
  },

  async removePlayer(code, id) {
    await currentUser();
    await deleteDoc(doc(playersRef(code), id));
  },

  watchPlayers(code, cb) {
    let stop = () => {};
    let cancelled = false;
    currentUser().then(() => {
      if (cancelled) return;
      stop = onSnapshot(playersRef(code), (snap) => cb(sortPlayers(snap.docs.map((d) => d.data() as Player))));
    });
    return () => {
      cancelled = true;
      stop();
    };
  },
};
