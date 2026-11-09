import { squaresToWin } from '@/lib/bingo';
import type { Game, Player } from '@/lib/types';

export function PlayerDot({ color }: { color: string }) {
  return <span aria-hidden className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink" style={{ background: color }} />;
}

export function PlayerList({
  game,
  players,
  meId,
  showProgress = false,
  onKick,
}: {
  game: Game;
  players: Player[];
  meId: string;
  showProgress?: boolean;
  onKick?: (player: Player) => void;
}) {
  return (
    <ul className="space-y-1.5">
      {players.map((p) => {
        const dealt = p.round === game.round && p.card.length > 0;
        const away = dealt ? squaresToWin(p.marks, game.size, game.pattern) : null;
        const wins = game.scores[p.id] ?? 0;
        return (
          <li key={p.id} className="flex items-center gap-2 rounded-lg border-2 border-ink bg-white px-2.5 py-1.5">
            <PlayerDot color={p.color} />
            <span className="min-w-0 flex-1 truncate font-extrabold">
              {p.name}
              {p.id === meId && <span className="font-semibold text-muted"> (you)</span>}
            </span>
            {p.id === game.hostId && (
              <span className="chip bg-zap" title="Host">
                👑{!showProgress && ' host'}
              </span>
            )}
            {wins > 0 && (
              <span className="chip bg-white" title={`${wins} round${wins === 1 ? '' : 's'} won`}>
                🏆 {wins}
              </span>
            )}
            {showProgress && away !== null && (
              <span
                className={`chip ${away === 0 ? 'bg-pow text-white' : away === 1 ? 'animate-wobble bg-zap' : 'bg-paper'}`}
              >
                {away === 0 ? 'has it!' : `${away} away`}
              </span>
            )}
            {onKick && p.id !== meId && (
              <button
                type="button"
                onClick={() => onKick(p)}
                className="rounded px-1.5 text-lg font-black text-muted hover:bg-pow hover:text-white"
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
