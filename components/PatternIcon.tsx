import { patternGroups, type Pattern } from '@/lib/bingo';

/** Tiny 5×5 preview of a win pattern. */
export function PatternIcon({ pattern, className = 'h-6 w-6' }: { pattern: Pattern; className?: string }) {
  // For "line", show the middle row as an example.
  const groups = patternGroups(5, pattern);
  const on = new Set(pattern === 'line' ? groups[2] : groups[0]);
  return (
    <span aria-hidden className={`inline-grid shrink-0 grid-cols-5 gap-px rounded-sm border-2 border-ink bg-ink ${className}`}>
      {Array.from({ length: 25 }, (_, i) => (
        <span key={i} className={on.has(i) ? 'bg-pow' : 'bg-white'} />
      ))}
    </span>
  );
}
