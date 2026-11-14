import { useEffect, useState } from 'react';
import { backend } from './backend';
import { withDefaults } from './actions';
import type { Game, Player } from './types';

export function useUserId(): string | null {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    backend.getUserId().then(setUid);
  }, []);
  return uid;
}

/**
 * Live game + players for a code.
 * `game` is undefined while loading and null if it doesn't exist; `players` is undefined while loading.
 */
export function useGame(code: string | null) {
  const [game, setGame] = useState<Game | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[] | undefined>(undefined);

  useEffect(() => {
    if (!code) return;
    setGame(undefined);
    setPlayers(undefined);
    const stopGame = backend.watchGame(code, (g) => setGame(g ? withDefaults(g) : g));
    const stopPlayers = backend.watchPlayers(code, (ps) =>
      setPlayers(ps.map((p) => ({ ...p, markedAt: p.markedAt ?? {}, readyRound: p.readyRound ?? 0 }))),
    );
    return () => {
      stopGame();
      stopPlayers();
    };
  }, [code]);

  return { game, players };
}

/** Re-render every `ms` milliseconds (for countdowns). */
export function useNow(ms = 250, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, active]);
  return now;
}
