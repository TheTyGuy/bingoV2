import { useEffect } from 'react';
import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { PlayerDot } from '@/components/PlayerList';
import { backToSetup, nextRound } from '@/lib/actions';
import { winningCells } from '@/lib/bingo';
import type { Game, Player } from '@/lib/types';

export function Won({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const claim = game.claim!;
  const winner = players.find((p) => p.id === claim.playerId);
  const isHost = me.id === game.hostId;
  const host = players.find((p) => p.id === game.hostId);
  const iWon = claim.playerId === me.id;

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

  const ranked = [...players].sort((a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0));

  return (
    <div className="mx-auto max-w-3xl text-center">
      <Burst className="mx-auto aspect-[1.6] w-[min(94vw,34rem)] animate-pop-in">
        <span className="comic block text-[min(15vw,5rem)] leading-none text-white [-webkit-text-stroke:2px_var(--color-ink)] [text-shadow:3px_3px_0_var(--color-ink)]">
          kaBINGO!
        </span>
        <span className="comic mx-auto mt-1 block max-w-[70%] text-[min(6vw,1.8rem)] leading-none">
          {iWon ? 'You win' : `${winner?.name ?? 'Someone'} wins`} round {game.round}!
        </span>
      </Burst>

      <div className="mt-4 grid items-start gap-5 text-left sm:grid-cols-[minmax(0,1fr)_16rem]">
        {winner && (
          <BingoCard
            label={`${winner.name}'s winning card`}
            card={winner.card}
            prompts={game.prompts}
            marks={claim.marks}
            size={game.size}
            freeImage={game.freeImage}
            highlight={winningCells(claim.marks, game.size, game.pattern)}
          />
        )}
        <section className="panel p-4">
          <h2 className="comic text-2xl">Scoreboard</h2>
          <ol className="mt-2 space-y-1.5">
            {ranked.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 font-extrabold">
                <span className="comic w-5 text-lg text-muted">{i + 1}</span>
                <PlayerDot color={p.color} />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="comic text-xl">{game.scores[p.id] ?? 0}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isHost ? (
          <>
            <button type="button" className="btn btn-pow text-2xl" onClick={() => nextRound(game.code)}>
              Deal another round
            </button>
            <button type="button" className="btn btn-plain" onClick={() => backToSetup(game.code)}>
              Edit predictions
            </button>
          </>
        ) : (
          <p className="caption text-xl">Waiting for {host?.name ?? 'the host'} to start the next round…</p>
        )}
      </div>
    </div>
  );
}
