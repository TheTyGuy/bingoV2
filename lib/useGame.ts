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

  // Backstop while a vote is open: if this phone's live updates have stalled
  // (it happens on some mobile networks, or right after a phone wakes up),
  // check the server directly so nobody is stuck on a vote that's already over.
  const voting = game?.phase === 'voting';
  useEffect(() => {
    if (!code || !voting) return;
    const t = setInterval(async () => {
      const fresh = await backend.fetchGameDirect(code).catch(() => null);
      if (fresh && fresh.phase !== 'voting') setGame((g) => (g?.phase === 'voting' ? withDefaults(fresh) : g));
    }, 3000);
    return () => clearInterval(t);
  }, [code, voting]);

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
