import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { DealButton, InvitePanel, PredictionsPanel, SettingsPanel } from '@/components/lobby';
import { PlayerDot } from '@/components/PlayerList';
import { kickPlayer, leaveGame, setReady } from '@/lib/actions';
import type { Game, Player } from '@/lib/types';

/** Between rounds: who won, the scoreboard, who's in for another, and a chance to edit predictions. */
export function Won({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const router = useRouter();
  const claim = game.claim!;
  const winner = players.find((p) => p.id === claim.playerId);
  const isHost = me.id === game.hostId;
  const iWon = claim.playerId === me.id;
  const nextRound = game.round + 1;
  const iAmReady = me.readyRound === nextRound;
  const readyCount = players.filter((p) => p.readyRound === nextRound).length;
  const notReady = players.filter((p) => p.readyRound !== nextRound);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return;
      const colors = ['#e63946', '#ffd60a', '#1d6fd8', '#2a9d8f', '#ffffff'];
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.35 }, colors });
      setTimeout(() => !cancelled && confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 300);
      setTimeout(() => !cancelled && confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 500);
    });
    return () => {
      cancelled = true;
    };
  }, [game.round]);

  const ranked = [...players].sort((a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0) || a.joinedAt - b.joinedAt);

  async function onLeave() {
    if (!confirm('Leave this game?')) return;
    await leaveGame(game.code, me.id);
    router.push('/');
  }

  return (
    <div>
      <Burst className="mx-auto aspect-[1.6] w-[min(94vw,34rem)] animate-pop-in">
        <span className="comic block text-[min(15vw,5rem)] leading-none text-white [-webkit-text-stroke:2px_var(--color-ink)] [text-shadow:3px_3px_0_var(--color-ink)]">
          kaBINGO!
        </span>
        <span className="comic mx-auto mt-1 block max-w-[70%] text-[min(6vw,1.8rem)] leading-none">
          {iWon ? 'You win' : `${winner?.name ?? 'Someone'} wins`} round {game.round}!
        </span>
      </Burst>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="panel p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="comic text-3xl">Scoreboard</h2>
              <span className="font-bold text-muted">
                {game.round} round{game.round === 1 ? '' : 's'} played
              </span>
            </div>
            <ol className="mt-2 space-y-1.5">
              {ranked.map((p, i) => {
                const ready = p.readyRound === nextRound;
                return (
                  <li key={p.id} className="flex items-center gap-2 rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 font-extrabold">
                    <span className="comic w-5 text-lg text-muted">{i + 1}</span>
                    <PlayerDot color={p.color} />
                    <span className="min-w-0 flex-1 truncate">
                      {p.name}
                      {p.id === game.hostId && <span title="Host"> 👑</span>}
                    </span>
                    <span className={`chip ${ready ? 'bg-zing text-white' : 'bg-paper text-muted'}`}>{ready ? '✓ in' : '…'}</span>
                    <span className="comic w-7 text-right text-2xl">{game.scores[p.id] ?? 0}</span>
                    {isHost && p.id !== me.id && (
                      <button
                        type="button"
                        onClick={() => confirm(`Remove ${p.name} from the game?`) && kickPlayer(game.code, p.id)}
                        className="rounded px-1 text-lg font-black text-muted hover:bg-pow hover:text-white"
                        aria-label={`Remove ${p.name}`}
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="panel p-4 text-center">
            <h2 className="comic text-3xl">Another round?</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                aria-pressed={iAmReady}
                className={`btn ${iAmReady ? 'btn-boom' : 'btn-zap'} flex-1`}
                onClick={() => setReady(game, me.id, !iAmReady)}
              >
                {iAmReady ? "✓ I'm in!" : "I'm in!"}
              </button>
              <button type="button" className="btn btn-plain" onClick={onLeave}>
                I&apos;m out
              </button>
            </div>
            <p className="mt-3 font-bold">
              {readyCount} of {players.length} ready
              {notReady.length > 0 && <span className="text-muted"> · waiting on {notReady.map((p) => p.name).join(', ')}</span>}
            </p>
            <div className="mt-4">
              <DealButton
                game={game}
                players={players}
                me={me}
                label="Deal next round"
                readyHint={
                  isHost && notReady.length > 0 ? (
                    <p className="mb-2 text-sm font-semibold text-muted">Polite to wait until everyone&apos;s in, but you can deal anytime.</p>
                  ) : null
                }
              />
            </div>
          </section>

          {winner && (
            <details className="panel p-4">
              <summary className="comic cursor-pointer text-2xl">{iWon ? 'Your' : `${winner.name}'s`} winning card</summary>
              <div className="mt-3">
                <BingoCard
                  label={`${winner.name}'s winning card`}
                  card={winner.card}
                  prompts={game.prompts}
                  marks={claim.marks}
                  size={game.size}
                  freeImage={game.freeImage}
                  highlight={claim.cells}
                />
              </div>
            </details>
          )}
        </div>

        <div className="space-y-5">
          <PredictionsPanel game={game} players={players} me={me} title="Predictions for next round" />
          <SettingsPanel game={game} me={me} />
          <InvitePanel game={game} compact />
        </div>
      </div>
    </div>
  );
}
