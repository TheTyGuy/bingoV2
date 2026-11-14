import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { PatternIcon } from '@/components/PatternIcon';
import { PlayerDot, PlayerList } from '@/components/PlayerList';
import { backToSetup, callBingo, setMark, toggleMark } from '@/lib/actions';
import { FREE, PATTERNS, squaresToWin } from '@/lib/bingo';
import { useNow } from '@/lib/useGame';
import type { Game, Player } from '@/lib/types';

const BUSTED_SHOW_MS = 15_000;

export function Playing({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const isHost = me.id === game.hostId;
  const pattern = PATTERNS.find((p) => p.id === game.pattern)!;
  const dealt = me.round === game.round && me.card.length > 0;
  const myStruck = game.struck[me.id] ?? [];
  const away = dealt ? squaresToWin(me.marks, game.size, game.pattern, myStruck) : Infinity;
  const canCall = away === 0 && game.phase === 'playing';

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
          <div role="status" className="panel animate-pop-in mb-3 bg-ink p-3 text-center text-white">
            <span className="comic text-3xl text-zap">BUSTED!</span>{' '}
            <span className="font-bold">
              {busted.playerId === me.id
                ? `The table rejected your kaBINGO! and struck out ${busted.struck.length} square${busted.struck.length === 1 ? '' : 's'}. Find another way!`
                : `The table rejected ${bustedName ?? 'a'}'s kaBINGO!`}
            </span>
          </div>
        )}

        {dealt ? (
          <BingoCard
            label="Your card"
            card={me.card}
            prompts={game.prompts}
            marks={me.marks}
            struck={myStruck}
            size={game.size}
            freeImage={game.freeImage}
            disabled={game.phase !== 'playing'}
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
            aria-label={canCall ? 'Call kaBINGO!' : away === Infinity ? 'No way left to win' : `${away} squares to go`}
          >
            <Burst
              className={`h-36 w-64 transition-transform ${canCall ? 'animate-wobble group-hover:scale-105' : 'grayscale opacity-60'}`}
              fill={canCall ? 'var(--color-zap)' : 'white'}
              ring={canCall ? 'var(--color-pow)' : 'var(--color-paper-dark)'}
            >
              <span className="comic block text-4xl leading-none [text-shadow:2px_2px_0_white]">
                {canCall ? 'kaBINGO!' : away === Infinity ? 'Blocked!' : `${away} to go`}
              </span>
            </Burst>
          </button>
          {canCall && <p className="comic text-xl text-pow">You&apos;ve got it! Call it!</p>}
          {dealt && away === Infinity && (
            <p className="max-w-sm text-center font-bold text-muted">
              Struck squares block every way to win this round. Keep watching: you can still vote on other calls.
            </p>
          )}
        </div>

        {game.showCalls && <CalledSquares game={game} players={players} me={me} />}
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

/**
 * Like a caller shouting "B-16": every square anyone has marked this round,
 * newest first, so you can catch ones you missed on your own card.
 */
function CalledSquares({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const text = new Map(game.prompts.map((p) => [p.id, p.text]));
  const calls = new Map<string, { promptId: string; at: number; by: Player[] }>();
  for (const p of players) {
    if (p.round !== game.round) continue;
    for (const idx of p.marks) {
      const promptId = p.card[idx];
      if (!promptId || promptId === FREE) continue;
      const at = p.markedAt[promptId] ?? 0;
      const entry = calls.get(promptId) ?? { promptId, at, by: [] };
      entry.at = Math.min(entry.at, at); // when it was first called
      entry.by.push(p);
      calls.set(promptId, entry);
    }
  }
  const list = [...calls.values()].sort((a, b) => b.at - a.at);
  const myIndex = new Map(me.card.map((id, i) => [id, i]));
  const myStruck = new Set(game.struck[me.id] ?? []);

  return (
    <section className="panel mt-6 p-4" aria-live="polite">
      <h2 className="comic text-2xl">Called squares</h2>
      <p className="text-sm font-semibold text-muted">Everything anyone has marked this round, newest first.</p>
      {list.length === 0 ? (
        <p className="mt-3 font-bold text-muted">Nothing yet. Eyes open…</p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {list.map((c) => {
            const idx = myIndex.get(c.promptId);
            const onMyCard = idx !== undefined;
            const mine = onMyCard && me.marks.includes(idx);
            const struck = onMyCard && myStruck.has(idx);
            return (
              <li
                key={c.promptId}
                className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 ${
                  onMyCard && !mine && !struck ? 'border-pow bg-zap/40' : 'border-ink/70 bg-paper/50'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{text.get(c.promptId) ?? '(removed)'}</span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold text-muted">
                    {c.by.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1">
                        <PlayerDot color={p.color} />
                        {p.id === me.id ? 'you' : p.name}
                      </span>
                    ))}
                  </span>
                </span>
                {onMyCard &&
                  (struck ? (
                    <span className="chip bg-ink/10 text-muted">struck</span>
                  ) : mine ? (
                    <span className="chip bg-zing text-white">✓ on your card</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-pow btn-sm"
                      disabled={game.phase !== 'playing'}
                      onClick={() => setMark(game, me, idx, true)}
                    >
                      Mark it!
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
