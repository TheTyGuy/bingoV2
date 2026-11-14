import { useState, type FormEvent } from 'react';
import { PatternIcon } from '@/components/PatternIcon';
import { PlayerDot, PlayerList } from '@/components/PlayerList';
import { QRCode } from '@/components/QRCode';
import {
  MAX_PROMPT_LENGTH,
  addPack,
  addPrompt,
  clearPrompts,
  kickPlayer,
  removePrompt,
  startGame,
  updateSettings,
} from '@/lib/actions';
import { CARD_SIZES, PATTERNS, promptsNeeded } from '@/lib/bingo';
import { PACKS } from '@/lib/packs';
import type { Game, Player } from '@/lib/types';

export function Setup({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  const isHost = me.id === game.hostId;
  const host = players.find((p) => p.id === game.hostId);
  const needed = promptsNeeded(game.size);
  const have = game.prompts.length;
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const inviteUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/game?code=${game.code}`;

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

  const playerById = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className="panel p-4 text-center">
          <h2 className="comic text-2xl">Invite the crew</h2>
          <p className="comic mt-1 text-6xl tracking-[0.15em] text-pow [text-shadow:3px_3px_0_var(--color-ink)]">{game.code}</p>
          <QRCode value={inviteUrl} className="mx-auto mt-3 h-40 w-40" />
          <button type="button" className="btn btn-boom btn-sm mt-3" onClick={onShare}>
            Share invite link
          </button>
        </section>

        <section className="panel p-4">
          <h2 className="comic text-2xl">Players ({players.length})</h2>
          <div className="mt-2">
            <PlayerList game={game} players={players} meId={me.id} onKick={isHost ? (p) => kickPlayer(game.code, p.id) : undefined} />
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="panel p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="comic text-3xl">The predictions</h2>
            <span className={`chip ${have >= needed ? 'bg-zing text-white' : 'bg-paper'}`}>
              {have} / {needed} needed
            </span>
          </div>
          <p className="mt-1 font-semibold text-muted">
            Add things you&apos;re sure will happen. Everyone&apos;s card is shuffled from this list.
          </p>
          <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
            <div className="h-full bg-zing transition-all" style={{ width: `${Math.min(100, (have / needed) * 100)}%` }} />
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

          {have > 0 && (
            <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto pr-1">
              {[...game.prompts].reverse().map((p) => {
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
          {isHost && have > 0 && (
            <button
              type="button"
              className="mt-2 text-sm font-bold text-muted underline"
              onClick={() => confirm('Remove every prediction?') && clearPrompts(game.code)}
            >
              Clear all
            </button>
          )}
        </section>

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
                <OptionButton
                  key={p.id}
                  active={game.pattern === p.id}
                  title={p.hint}
                  onClick={() => updateSettings(game.code, { pattern: p.id })}
                >
                  <PatternIcon pattern={p.id} className="h-5 w-5" /> {p.label}
                </OptionButton>
              ))}
            </div>
          </fieldset>
        </section>

        <div className="text-center">
          {isHost ? (
            <>
              <button
                type="button"
                className="btn btn-pow px-10 py-4 text-3xl shadow-comic-lg"
                disabled={have < needed}
                onClick={() => startGame(game.code)}
              >
                Deal the cards!
              </button>
              {have < needed && (
                <p className="mt-2 font-bold text-muted">
                  {needed - have} more prediction{needed - have === 1 ? '' : 's'} to go (or pick a smaller card).
                </p>
              )}
            </>
          ) : (
            <p className="caption text-xl">Waiting for {host?.name ?? 'the host'} to deal the cards…</p>
          )}
        </div>
      </div>
    </div>
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
  children: React.ReactNode;
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
