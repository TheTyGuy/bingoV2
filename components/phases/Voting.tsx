import { BingoCard } from '@/components/BingoCard';
import { Burst } from '@/components/Burst';
import { PlayerDot } from '@/components/PlayerList';
import { castVote, VOTE_SECONDS } from '@/lib/actions';
import { FREE, winningCells } from '@/lib/bingo';
import { useNow } from '@/lib/useGame';
import type { Game, Player } from '@/lib/types';

export function Voting({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const claim = game.claim!;
  const now = useNow(250);
  const caller = players.find((p) => p.id === claim.playerId);
  const isCaller = claim.playerId === me.id;
  const secondsLeft = Math.max(0, Math.ceil((claim.deadline - now) / 1000));
  const voters = players.filter((p) => p.id !== claim.playerId);
  const legit = voters.filter((p) => claim.votes[p.id] === true);
  const nope = voters.filter((p) => claim.votes[p.id] === false);
  const waiting = voters.filter((p) => !(p.id in claim.votes));
  const myVote = claim.votes[me.id];

  const cells = caller ? winningCells(claim.marks, game.size, game.pattern) : [];
  const byId = new Map(game.prompts.map((p) => [p.id, p.text]));
  const evidence = caller ? cells.map((i) => caller.card[i]).filter((id) => id !== FREE).map((id) => byId.get(id) ?? '(removed)') : [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
        <Burst className="h-44 w-80 max-w-full animate-pop-in">
          <span className="comic block max-w-52 truncate text-2xl leading-none">{isCaller ? 'You' : (caller?.name ?? 'Someone')} called</span>
          <span className="comic block text-5xl leading-none text-pow [text-shadow:2px_2px_0_var(--color-ink)]">kaBINGO!</span>
        </Burst>
        <div className="text-center" aria-live="polite">
          <div className="comic text-7xl leading-none tabular-nums">{secondsLeft}</div>
          <div className="font-bold text-muted">seconds to vote</div>
          <div className="mx-auto mt-1 h-2.5 w-36 overflow-hidden rounded-full border-2 border-ink bg-white">
            <div className="h-full bg-pow transition-all" style={{ width: `${(secondsLeft / VOTE_SECONDS) * 100}%` }} />
          </div>
        </div>
      </div>

      <section className="panel mt-5 p-4">
        <h2 className="comic text-2xl">{isCaller ? 'Your evidence' : 'Did all of these really happen?'}</h2>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {evidence.map((t) => (
            <li key={t} className="rounded-lg border-2 border-ink bg-zap/50 px-2.5 py-1 font-extrabold">
              {t}
            </li>
          ))}
        </ul>

        {isCaller ? (
          <p className="caption mt-4 text-xl">The table is deciding your fate…</p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-pressed={myVote === true}
              className={`btn ${myVote === true ? 'btn-boom' : 'btn-plain'} flex-1`}
              onClick={() => castVote(game.code, me.id, true)}
            >
              ✅ Legit!
            </button>
            <button
              type="button"
              aria-pressed={myVote === false}
              className={`btn ${myVote === false ? 'btn-pow' : 'btn-plain'} flex-1`}
              onClick={() => castVote(game.code, me.id, false)}
            >
              ❌ No way!
            </button>
          </div>
        )}

        <div className="mt-4 grid gap-2 text-sm font-bold sm:grid-cols-3">
          <VoteColumn label={`Legit (${legit.length})`} players={legit} />
          <VoteColumn label={`No way (${nope.length})`} players={nope} />
          <VoteColumn label={`Still deciding (${waiting.length})`} players={waiting} />
        </div>
        <p className="mt-3 text-sm font-semibold text-muted">
          Majority rules. Ties and no-shows go to the caller.
        </p>
      </section>

      {caller && (
        <div className="mx-auto mt-5 max-w-md">
          <h2 className="comic mb-2 text-center text-2xl">{isCaller ? 'Your' : `${caller.name}'s`} card</h2>
          <BingoCard
            label={`${caller.name}'s card`}
            card={caller.card}
            prompts={game.prompts}
            marks={claim.marks}
            size={game.size}
            freeImage={game.freeImage}
            highlight={cells}
          />
        </div>
      )}
    </div>
  );
}

function VoteColumn({ label, players }: { label: string; players: Player[] }) {
  return (
    <div className="rounded-lg border-2 border-ink/30 bg-paper/50 p-2">
      <div className="comic text-lg">{label}</div>
      <ul className="mt-1 space-y-0.5">
        {players.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5">
            <PlayerDot color={p.color} /> {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
