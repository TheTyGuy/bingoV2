// Demo backend: stores games in localStorage and syncs between tabs of the
// same browser via the `storage` event. Each tab is its own player, so you
// can open a few tabs and play against yourself without any Firebase setup.
import type { Game, Player } from '../types';
import type { Backend } from './types';

const gameKey = (code: string) => `kabingo:game:${code}`;
// One key per player so tabs writing at the same time don't clobber each other.
const playersPrefix = (code: string) => `kabingo:player:${code}:`;
const playerKey = (code: string, id: string) => playersPrefix(code) + id;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function notify(key: string) {
  // storage events only reach *other* tabs, so tell this tab's listeners directly
  listeners.forEach((fns, prefix) => key.startsWith(prefix) && fns.forEach((fn) => fn()));
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  notify(key);
}

function remove(key: string) {
  localStorage.removeItem(key);
  notify(key);
}

/** Listen for changes to any key starting with `prefix`. */
function listen(prefix: string, fn: Listener): () => void {
  if (!listeners.has(prefix)) listeners.set(prefix, new Set());
  listeners.get(prefix)!.add(fn);
  const onStorage = (e: StorageEvent) => (e.key === null || e.key.startsWith(prefix)) && fn();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.get(prefix)?.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

function playerList(code: string): Player[] {
  const prefix = playersPrefix(code);
  const players: Player[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const player = key?.startsWith(prefix) ? read<Player>(key) : null;
    if (player) players.push(player);
  }
  return players.sort((a, b) => a.joinedAt - b.joinedAt);
}

export const localBackend: Backend = {
  mode: 'local',

  async getUserId() {
    // sessionStorage: one player per tab, survives reloads.
    let id = sessionStorage.getItem('kabingo:uid');
    if (!id) {
      id = `local-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('kabingo:uid', id);
    }
    return id;
  },

  async createGame(game) {
    if (read(gameKey(game.code))) return false;
    write(gameKey(game.code), game);
    return true;
  },

  async getGame(code) {
    return read<Game>(gameKey(code));
  },

  async updateGame(code, fn) {
    const current = read<Game>(gameKey(code));
    if (!current) return null;
    const next = fn(current);
    if (next) write(gameKey(code), next);
    return next;
  },

  watchGame(code, cb) {
    const emit = () => cb(read<Game>(gameKey(code)));
    emit();
    return listen(gameKey(code), emit);
  },

  async getPlayers(code) {
    return playerList(code);
  },

  async setPlayer(code, player) {
    write(playerKey(code, player.id), player);
  },

  async updatePlayer(code, id, patch) {
    const current = read<Player>(playerKey(code, id));
    if (current) write(playerKey(code, id), { ...current, ...patch });
  },

  async markSquare(code, id, index, promptId, on) {
    const p = read<Player>(playerKey(code, id));
    if (!p) return;
    const marks = p.marks.filter((i) => i !== index);
    const markedAt = { ...p.markedAt };
    if (on) {
      marks.push(index);
      markedAt[promptId] = Date.now();
    } else delete markedAt[promptId];
    write(playerKey(code, id), { ...p, marks, markedAt });
  },

  async removePlayer(code, id) {
    remove(playerKey(code, id));
  },

  watchPlayers(code, cb) {
    const emit = () => cb(playerList(code));
    emit();
    return listen(playersPrefix(code), emit);
  },
};
