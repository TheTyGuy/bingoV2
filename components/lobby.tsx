// Panels shared by the setup screen and the between-rounds score screen.
import { useState, type FormEvent, type ReactNode } from 'react';
import { PatternIcon } from '@/components/PatternIcon';
import { PlayerDot, PlayerList } from '@/components/PlayerList';
import { QRCode } from '@/components/QRCode';
import {
  MAX_PROMPT_LENGTH,
  addPack,
  addPrompt,
  clearPrompts,
  dealRound,
  kickPlayer,
  removePrompt,
  updateSettings,
} from '@/lib/actions';
import { CARD_SIZES, PATTERNS, dealShortfall, promptVisible, promptsNeeded } from '@/lib/bingo';
import { PACKS } from '@/lib/packs';
import type { Game, Player } from '@/lib/types';

type Props = { game: Game; players: Player[]; me: Player };

export function InvitePanel({ game, compact = false }: { game: Game; compact?: boolean }) {
  const [note, setNote] = useState('');
  const inviteUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/game?code=${game.code}`;

  async function onShare() {
    const data = { title: 'kaBINGO!', text: `Join my kaBINGO! game. Code: ${game.code}`, url: inviteUrl };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(inviteUrl);
      setNote('Invite link copied!');
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <section className="panel p-4 text-center">
      <h2 className="comic text-2xl">{compact ? 'More players?' : 'Invite the crew'}</h2>
      <p className="comic mt-1 text-6xl tracking-[0.15em] text-pow [text-shadow:3px_3px_0_var(--color-ink)]">{game.code}</p>
      {!compact && <QRCode value={inviteUrl} className="mx-auto mt-3 h-40 w-40" />}
      <button type="button" className="btn btn-boom btn-sm mt-3" onClick={onShare}>
        Share invite link
      </button>
      {note && <p className="mt-2 text-sm font-bold text-boom">{note}</p>}
    </section>
  );
}

export function PlayersPanel({ game, players, me, showReady = false }: Props & { showReady?: boolean }) {
  const isHost = me.id === game.hostId;
  return (
    <section className="panel p-4">
      <h2 className="comic text-2xl">Players ({players.length})</h2>
      <div className="mt-2">
        <PlayerList
          game={game}
          players={players}
          meId={me.id}
          showReady={showReady}
          onKick={isHost ? (p) => confirm(`Remove ${p.name} from the game?`) && kickPlayer(game.code, p.id) : undefined}
        />
      </div>
    </section>
  );
}

export function PredictionsPanel({ game, players, me, title = 'The predictions' }: Props & { title?: string }) {
  const isHost = me.id === game.hostId;
  const needed = promptsNeeded(game.size);
  const total = game.prompts.length;
  const visible = game.prompts.filter((p) => promptVisible(p, me.id, game.showPrompts, game.round));
  const hiddenCount = total - visible.length;
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const playerById = new Map(players.map((p) => [p.id, p]));

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const result = await addPrompt(game.code, me.id, text);
    if (result === 'duplicate') setNote('Someone already predicted that one!');
    else {
      setNote('');
      setText('');
    }
  }

  async function onPack(id: string) {
    const added = await addPack(game.code, id);
    setNote(added ? `Added ${added} predictions.` : 'All of those are already on the list.');
  }

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="comic text-3xl">{title}</h2>
        <span className={`chip ${total >= needed ? 'bg-zing text-white' : 'bg-paper'}`}>
          {total} / {needed} needed
        </span>
      </div>
      <p className="mt-1 font-semibold text-muted">
        {game.showPrompts
          ? "Add things you're sure will happen. Everyone's card is shuffled from this list."
          : "Secret mode: you only see your own predictions, and you'll never get your own on your card."}
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
        <div className="h-full bg-zing transition-all" style={{ width: `${Math.min(100, (total / needed) * 100)}%` }} />
      </div>

      <form onSubmit={onAdd} className="mt-3 flex gap-2">
        <input
          aria-label="New prediction"
          className="input min-w-0 flex-1"
          placeholder='e.g. "Someone mentions the traffic"'
          value={text}
          maxLength={MAX_PROMPT_LENGTH}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-zap" disabled={!text.trim()}>
          Add
        </button>
      </form>
      {note && (
        <p role="status" className="mt-2 font-bold text-boom">
          {note}
        </p>
      )}

      {isHost && (
        <div className="mt-4">
          <h3 className="comic text-xl">Starter packs</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {PACKS.map((p) => (
              <button key={p.id} type="button" className="btn btn-plain btn-sm" onClick={() => onPack(p.id)}>
                <span aria-hidden>{p.emoji}</span> {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {(visible.length > 0 || hiddenCount > 0) && (
        <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto pr-1">
          {hiddenCount > 0 && (
            <li className="flex items-center gap-2 rounded-lg border-2 border-dashed border-ink/50 px-2.5 py-1 font-bold text-muted">
              <span aria-hidden>🤫</span> {hiddenCount} secret prediction{hiddenCount === 1 ? '' : 's'} from the others
            </li>
          )}
          {[...visible].reverse().map((p) => {
            const author = playerById.get(p.by);
            const canRemove = isHost || p.by === me.id;
            return (
              <li key={p.id} className="flex items-center gap-2 rounded-lg border-2 border-ink/80 bg-paper/60 px-2.5 py-1">
                {author ? <PlayerDot color={author.color} /> : <span aria-hidden className="w-3.5 text-center text-xs">★</span>}
                <span className="min-w-0 flex-1 font-bold">{p.text}</span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => removePrompt(game.code, p.id)}
                    className="rounded px-1.5 text-lg font-black text-muted hover:bg-pow hover:text-white"
                    aria-label={`Remove "${p.text}"`}
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {isHost && total > 0 && (
        <button
          type="button"
          className="mt-2 text-sm font-bold text-muted underline"
          onClick={() => confirm('Remove every prediction, including the secret ones?') && clearPrompts(game.code)}
        >
          Clear all
        </button>
      )}
    </section>
  );
}

export function SettingsPanel({ game, me }: { game: Game; me: Player }) {
  const isHost = me.id === game.hostId;
  return (
    <section className="panel p-4">
      <h2 className="comic text-2xl">Game settings</h2>
      {!isHost && <p className="text-sm font-semibold text-muted">The host picks these.</p>}
      <fieldset className="mt-2" disabled={!isHost}>
        <legend className="font-extrabold">Card size</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {CARD_SIZES.map((s) => (
            <OptionButton key={s.size} active={game.size === s.size} onClick={() => updateSettings(game.code, { size: s.size })}>
              {s.label}
            </OptionButton>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-3" disabled={!isHost}>
        <legend className="font-extrabold">To win, get…</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <OptionButton key={p.id} active={game.pattern === p.id} title={p.hint} onClick={() => updateSettings(game.code, { pattern: p.id })}>
              <PatternIcon pattern={p.id} className="h-5 w-5" /> {p.label}
            </OptionButton>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 space-y-3">
        <Toggle
          label="Show everyone's predictions"
          hint={
            game.showPrompts
              ? 'Everyone can see the whole list before the deal.'
              : "Secret mode: you only see your own, and you never get your own on your card."
          }
          on={game.showPrompts}
          disabled={!isHost}
          onChange={(v) => updateSettings(game.code, { showPrompts: v })}
        />
        <Toggle
          label="Show called squares"
          hint={
            game.showCalls
              ? 'A shared list under the board shows every square anyone marks, so you can catch ones you missed.'
              : 'Players only see how close everyone is, not what they marked.'
          }
          on={game.showCalls}
          disabled={!isHost}
          onChange={(v) => updateSettings(game.code, { showCalls: v })}
        />
      </div>
    </section>
  );
}

/** Host: deal the cards. Everyone else: who we're waiting on. */
export function DealButton({ game, players, me, label, readyHint }: Props & { label: string; readyHint?: ReactNode }) {
  const isHost = me.id === game.hostId;
  const host = players.find((p) => p.id === game.hostId);
  const [busy, setBusy] = useState(false);
  const shortfall = dealShortfall(
    game.prompts,
    players.map((p) => p.id),
    game.size,
    !game.showPrompts,
  );
  const needed = promptsNeeded(game.size);

  if (!isHost) return <p className="caption text-xl">Waiting for {host?.name ?? 'the host'} to deal the cards…</p>;

  let problem = '';
  if (shortfall.length > 0) {
    if (game.showPrompts) {
      const missing = needed - shortfall[0].have;
      problem = `${missing} more prediction${missing === 1 ? '' : 's'} to go (or pick a smaller card).`;
    } else {
      const names = shortfall.map((s) => players.find((p) => p.id === s.playerId)?.name ?? '?');
      problem = `Secret mode needs ${needed} predictions that each player didn't write. Short for: ${names.join(', ')}. Add more, use a starter pack, or pick a smaller card.`;
    }
  }

  return (
    <div className="text-center">
      {readyHint}
      <button
        type="button"
        className="btn btn-pow px-10 py-4 text-3xl shadow-comic-lg"
        disabled={!!problem || busy}
        onClick={async () => {
          setBusy(true);
          await dealRound(
            game.code,
            players.map((p) => p.id),
          ).finally(() => setBusy(false));
        }}
      >
        {label}
      </button>
      {problem && <p className="mx-auto mt-2 max-w-md font-bold text-muted">{problem}</p>}
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  disabled: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? '' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border-[3px] border-ink transition-colors disabled:cursor-default ${
          on ? 'bg-zing' : 'bg-paper-dark'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-white transition-all ${on ? 'left-[1.45rem]' : 'left-0.5'}`}
        />
      </button>
      <span>
        <span className="block font-extrabold">{label}</span>
        <span className="block text-sm font-semibold text-muted">{hint}</span>
      </span>
    </label>
  );
}

function OptionButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-3 py-1.5 font-extrabold transition-colors disabled:cursor-default ${
        active ? 'bg-boom text-white shadow-comic-sm' : 'bg-white enabled:hover:bg-paper'
      }`}
    >
      {children}
    </button>
  );
}
