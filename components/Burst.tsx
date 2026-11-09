import type { ReactNode } from 'react';

// Deterministic jagged starburst, like a comic "POW!" balloon.
function burstPoints(spikes: number, outer: number, inner: number, jitter: number): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const wobble = 1 + jitter * Math.sin(i * 2.7);
    const r = (i % 2 === 0 ? outer : inner) * wobble;
    pts.push(`${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const OUTER = burstPoints(16, 48, 34, 0.06);
const INNER = burstPoints(16, 41, 29, 0.06);

export function Burst({
  fill = 'var(--color-zap)',
  ring = 'var(--color-pow)',
  className = '',
  spin = false,
  children,
}: {
  fill?: string;
  ring?: string;
  className?: string;
  spin?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className={`absolute inset-0 h-full w-full ${spin ? 'animate-spin-slow' : ''}`}>
        <polygon points={OUTER} fill={ring} stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={INNER} fill={fill} stroke="var(--color-ink)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

export function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  if (size === 'sm') {
    return (
      <span className="comic text-3xl leading-none [text-shadow:2px_2px_0_var(--color-zap)]">
        <span className="text-xl text-boom">ka</span>
        <span className="text-pow">BINGO!</span>
      </span>
    );
  }
  return (
    <Burst className="mx-auto aspect-square w-[min(88vw,26rem)] animate-pop-in">
      <h1 className="comic -rotate-6 leading-[0.8] [text-shadow:3px_3px_0_var(--color-ink)]">
        <span className="block text-[min(11vw,3.2rem)] text-boom">ka</span>
        <span className="block text-[min(19vw,5.6rem)] text-white [-webkit-text-stroke:2px_var(--color-ink)]">
          BINGO!
        </span>
      </h1>
    </Burst>
  );
}
