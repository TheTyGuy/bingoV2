import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { PatternIcon } from '@/components/PatternIcon';
import { PlayerList } from '@/components/PlayerList';
import { backToSetup, callBingo, toggleMark } from '@/lib/actions';
import { PATTERNS, squaresToWin } from '@/lib/bingo';
import { useNow } from '@/lib/useGame';
import type { Game, Player } from '@/lib/types';

const BUSTED_SHOW_MS = 10_000;

export function Playing({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const isHost = me.id === game.hostId;
  const pattern = PATTERNS.find((p) => p.id === game.pattern)!;
  const dealt = me.round === game.round && me.card.length > 0;
  const away = dealt ? squaresToWin(me.marks, game.size, game.pattern) : Infinity;
  const canCall = away === 0;

  const busted = game.lastResult && !game.lastResult.approved ? game.lastResult : null;
  const now = useNow(1000, !!busted);
  const bustedName = busted && players.find((p) => p.id === busted.playerId)?.name;
  const showBusted = busted && now - busted.at < BUSTED_SHOW_MS;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="caption flex items-center gap-2">
            <PatternIcon pattern={game.pattern} /> Get: {pattern.label}
          </span>
          <span className="comic text-xl text-muted">Round {game.round}</span>
        </div>

        {showBusted && (
          <div role="status" className="panel mb-3 -rotate-1 bg-ink p-3 text-center text-white">
            <span className="comic text-3xl text-zap">BUSTED!</span>{' '}
            <span className="font-bold">
              The table rejected {busted.playerId === me.id ? 'your' : `${bustedName ?? 'a'}'s`} kaBINGO!
            </span>
          </div>
        )}

        {dealt ? (
          <BingoCard
            label="Your card"
            card={me.card}
            prompts={game.prompts}
            marks={me.marks}
            size={game.size}
            freeImage={game.freeImage}
            onToggle={(i) => toggleMark(game, me, i)}
          />
        ) : (
          <div className="panel grid aspect-square place-items-center">
            <p className="comic animate-wobble text-3xl">Shuffling your card…</p>
          </div>
        )}

        <div className="mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={() => callBingo(game, me)}
            disabled={!canCall}
            className="group disabled:cursor-not-allowed"
            aria-label={canCall ? 'Call kaBINGO!' : `${away} squares to go`}
          >
            <Burst
              className={`h-36 w-64 transition-transform ${canCall ? 'animate-wobble group-hover:scale-105' : 'grayscale opacity-60'}`}
              fill={canCall ? 'var(--color-zap)' : 'white'}
              ring={canCall ? 'var(--color-pow)' : 'var(--color-paper-dark)'}
            >
              <span className="comic block text-4xl leading-none [text-shadow:2px_2px_0_white]">
                {canCall ? 'kaBINGO!' : `${away} to go`}
              </span>
            </Burst>
          </button>
          {canCall && <p className="comic text-xl text-pow">You&apos;ve got it! Call it!</p>}
        </div>
      </div>

      <aside className="space-y-4">
        <section className="panel p-4">
          <h2 className="comic text-2xl">The table</h2>
          <div className="mt-2">
            <PlayerList game={game} players={players} meId={me.id} showProgress />
          </div>
        </section>
        {isHost && (
          <button
            type="button"
            className="btn btn-plain btn-sm w-full"
            onClick={() => confirm('End this round and go back to editing predictions?') && backToSetup(game.code)}
          >
            End round &amp; edit predictions
          </button>
        )}
      </aside>
    </div>
  );
}
