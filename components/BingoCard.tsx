import { FREE, centerIndex } from '@/lib/bingo';
import type { Prompt } from '@/lib/types';

// Rows share the height of the tallest square (gridAutoRows: 1fr), so long
// predictions grow the card instead of getting clipped.
const CELL_STYLE: Record<number, string> = {
  3: 'min-h-24 text-base sm:min-h-36 sm:text-xl',
  5: 'min-h-16 text-[0.68rem] leading-tight sm:min-h-24 sm:text-sm',
  7: 'min-h-12 text-[0.55rem] leading-tight sm:min-h-20 sm:text-[0.72rem]',
};

export function FreeSpace({ image }: { image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="Free space" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-label="Free space">
      <rect width="100" height="100" fill="var(--color-pow)" />
      <polygon
        points="50,8 61,37 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,37"
        fill="var(--color-zap)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text x="50" y="60" textAnchor="middle" fontFamily="Bangers, Impact, sans-serif" fontSize="19" fill="var(--color-ink)">
        FREE
      </text>
    </svg>
  );
}

export function BingoCard({
  card,
  prompts,
  marks,
  size,
  freeImage,
  highlight = [],
  struck = [],
  flagged = [],
  selectable,
  onToggle,
  disabled = false,
  label,
}: {
  card: string[];
  prompts: Prompt[];
  marks: number[];
  size: number;
  freeImage: string | null;
  highlight?: number[];
  /** Squares voted out: shown with a big X and can't be marked. */
  struck?: number[];
  /** Squares a voter is flagging as "didn't happen" (pending X). */
  flagged?: number[];
  /** If set, only these squares respond to taps. */
  selectable?: number[];
  onToggle?: (index: number) => void;
  disabled?: boolean;
  label: string;
}) {
  const byId = new Map(prompts.map((p) => [p.id, p.text]));
  const marked = new Set(marks);
  const lit = new Set(highlight);
  const dead = new Set(struck);
  const flags = new Set(flagged);
  const canTap = selectable ? new Set(selectable) : null;
  const center = centerIndex(size);
  const gap = size === 7 ? 'gap-1' : size === 5 ? 'gap-1.5' : 'gap-2';

  return (
    <div
      role="grid"
      aria-label={label}
      className={`panel grid w-full ${gap} bg-ink p-1.5 sm:p-2`}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}
    >
      {card.map((id, i) => {
        const isFree = id === FREE || i === center;
        const isMarked = isFree || marked.has(i);
        const isLit = lit.has(i);
        const isStruck = dead.has(i);
        const isFlagged = flags.has(i);
        const tappable = !!onToggle && !disabled && !isFree && !isStruck && (!canTap || canTap.has(i));
        const text = isFree ? 'Free space' : (byId.get(id) ?? '(removed prompt)');
        return (
          <button
            key={i}
            role="gridcell"
            type="button"
            aria-pressed={canTap ? isFlagged : isMarked}
            aria-label={isStruck ? `${text} (struck out)` : text}
            disabled={!tappable}
            onClick={() => onToggle?.(i)}
            className={[
              'relative overflow-hidden rounded-md p-0.5 font-extrabold break-words hyphens-auto transition-colors sm:p-1.5',
              CELL_STYLE[size] ?? CELL_STYLE[5],
              isFree
                ? 'bg-pow'
                : isStruck
                  ? 'bg-paper-dark text-muted line-through decoration-2'
                  : isLit
                    ? 'bg-zap ring-4 ring-pow ring-inset'
                    : isMarked
                      ? 'bg-zap'
                      : 'bg-white',
              tappable ? `cursor-pointer active:scale-95 ${isMarked ? '' : 'hover:bg-paper-dark'}` : 'cursor-default',
              canTap && !canTap.has(i) && !isFree ? 'opacity-60' : '',
            ].join(' ')}
          >
            {isFree ? (
              <FreeSpace image={freeImage} />
            ) : (
              <>
                {isMarked && !isStruck && !isFlagged && (
                  <span
                    aria-hidden
                    className="animate-stamp absolute inset-[8%] rounded-full border-[3px] border-dashed border-pow/70"
                  />
                )}
                <span className="relative flex h-full items-center justify-center text-center">{text}</span>
                {(isStruck || isFlagged) && <BigX pending={isFlagged && !isStruck} />}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Comic-style X drawn over a square that was voted out (or is being flagged). */
function BigX({ pending }: { pending: boolean }) {
  const d = 'M16 16 L84 84 M84 16 L16 84';
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="animate-stamp pointer-events-none absolute inset-0 h-full w-full">
      <path d={d} stroke="var(--color-ink)" strokeWidth="17" strokeLinecap="round" />
      <path d={d} stroke="var(--color-pow)" strokeWidth="10" strokeLinecap="round" opacity={pending ? 1 : 0.9} />
    </svg>
  );
}
