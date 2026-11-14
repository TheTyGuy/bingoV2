import { useEffect, useState } from 'react';
import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { PlayerDot } from '@/components/PlayerList';
import { castVote, VOTE_SECONDS } from '@/lib/actions';
import { useNow } from '@/lib/useGame';
import type { Game, Player } from '@/lib/types';

/**
 * Full-screen pop-up shown to everyone the moment someone calls kaBINGO!
 * Voters check the caller's winning squares, then approve, or reject by
 * tapping the squares that didn't really happen.
 */
export function KabingoModal({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const claim = game.claim!;
  const now = useNow(250);
  const caller = players.find((p) => p.id === claim.playerId);
  const callerName = caller?.name ?? 'Someone';
  const isCaller = claim.playerId === me.id;
  const secondsLeft = Math.max(0, Math.ceil((claim.deadline - now) / 1000));
  const voters = players.filter((p) => p.id !== claim.playerId);
  const legit = voters.filter((p) => claim.votes[p.id]?.legit === true);
  const nope = voters.filter((p) => claim.votes[p.id]?.legit === false);
  const waiting = voters.filter((p) => !claim.votes[p.id]);
  const myVote = claim.votes[me.id];

  const [flagMode, setFlagMode] = useState(false);
  const [flags, setFlags] = useState<number[]>(myVote && !myVote.legit ? myVote.flagged : []);

  // Lock the page behind the pop-up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleFlag = (i: number) => setFlags((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));

  async function submitReject() {
    await castVote(game.code, me.id, { legit: false, flagged: flags });
    setFlagMode(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${callerName} called kaBINGO!`}
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/85 bg-[radial-gradient(rgb(255_214_10/0.18)_1.5px,transparent_1.7px)] bg-[length:12px_12px] px-4 py-5"
    >
      <div className="animate-pop-in mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-3">
          <Burst className="h-36 w-64 shrink-0">
            <span className="comic block max-w-44 truncate text-xl leading-none">{isCaller ? 'You' : callerName} called</span>
            <span className="comic block text-5xl leading-none text-pow [text-shadow:2px_2px_0_var(--color-ink)]">kaBINGO!</span>
          </Burst>
          <div className="text-center text-white" aria-live="polite">
            <div className="comic text-6xl leading-none tabular-nums">{secondsLeft}</div>
            <div className="text-sm font-bold">sec to vote</div>
            <div className="mx-auto mt-1 h-2.5 w-20 overflow-hidden rounded-full border-2 border-white bg-ink">
              <div className="h-full bg-zap transition-all" style={{ width: `${(secondsLeft / VOTE_SECONDS) * 100}%` }} />
            </div>
          </div>
        </div>

        {caller && (
          <div className="mt-3">
            <BingoCard
              label={`${callerName}'s card`}
              card={caller.card}
              prompts={game.prompts}
              marks={claim.marks}
              size={game.size}
              freeImage={game.freeImage}
              highlight={claim.cells}
              flagged={flagMode ? flags : []}
              selectable={flagMode ? claim.cells : undefined}
              onToggle={flagMode ? toggleFlag : undefined}
            />
          </div>
        )}

        <section className="panel mt-4 p-4">
          {isCaller ? (
            <p className="caption text-xl">The table is checking your card…</p>
          ) : flagMode ? (
            <>
              <h2 className="comic text-2xl">Which ones didn&apos;t happen?</h2>
              <p className="font-semibold text-muted">
                Tap the lit squares that didn&apos;t really happen. If the vote goes your way, they&apos;re struck from{' '}
                {callerName}&apos;s card.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn btn-pow flex-1" disabled={flags.length === 0} onClick={submitReject}>
                  ❌ Reject{flags.length ? ` (${flags.length})` : ''}
                </button>
                <button type="button" className="btn btn-plain" onClick={() => setFlagMode(false)}>
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="comic text-2xl">Did all the lit squares really happen?</h2>
              {myVote && (
                <p className="font-bold text-boom">
                  You voted {myVote.legit ? 'legit' : `no (${myVote.flagged.length} square${myVote.flagged.length === 1 ? '' : 's'})`}. You can
                  change it until time&apos;s up.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  aria-pressed={myVote?.legit === true}
                  className={`btn ${myVote?.legit === true ? 'btn-boom' : 'btn-plain'} flex-1`}
                  onClick={() => castVote(game.code, me.id, { legit: true, flagged: [] })}
                >
                  ✅ Legit!
                </button>
                <button
                  type="button"
                  aria-pressed={myVote?.legit === false}
                  className={`btn ${myVote?.legit === false ? 'btn-pow' : 'btn-plain'} flex-1`}
                  onClick={() => setFlagMode(true)}
                >
                  ❌ Not so fast!
                </button>
              </div>
            </>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-bold">
            <VoteColumn label={`Legit ${legit.length}`} players={legit} />
            <VoteColumn label={`Nope ${nope.length}`} players={nope} />
            <VoteColumn label={`Waiting ${waiting.length}`} players={waiting} />
          </div>
          <p className="mt-3 text-sm font-semibold text-muted">
            Majority of the votes wins. Ties and no-shows go to the caller.
          </p>
        </section>
      </div>
    </div>
  );
}

function VoteColumn({ label, players }: { label: string; players: Player[] }) {
  return (
    <div className="rounded-lg border-2 border-ink/30 bg-paper/50 p-2">
      <div className="comic text-lg">{label}</div>
      <ul className="mt-1 space-y-0.5">
        {players.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5 truncate">
            <PlayerDot color={p.color} /> {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
