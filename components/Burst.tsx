import type { ReactNode } from 'react';
import { GothicFlourish, LogoLeaves } from '@/components/SkinDecor';
import { useSkin } from '@/lib/useSkin';

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
  decor,
  children,
}: {
  fill?: string;
  ring?: string;
  className?: string;
  spin?: boolean;
  /** Extra art drawn around the burst (e.g. a skin's leaves). */
  decor?: ReactNode;
  children?: ReactNode;
}) {
  const skin = useSkin();
  return (
    <div className={`relative grid place-items-center ${className}`}>
      {skin.burstShape === 'moon' ? (
        // A full moon with a crimson halo instead of a comic starburst.
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="burst-moon" cx="0.42" cy="0.38">
              <stop offset="0" stopColor="#fbf8ee" />
              <stop offset="0.85" stopColor="#ddd5c2" />
              <stop offset="1" stopColor="#bdb39b" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="49" ry="49" fill={ring} opacity="0.35" />
          <ellipse cx="50" cy="50" rx="45" ry="45" fill="none" stroke={ring} strokeWidth="1.2" />
          <ellipse cx="50" cy="50" rx="42" ry="42" fill={fill === 'white' ? '#9aa2a8' : 'url(#burst-moon)'} />
          <g fill="#b9b19c" opacity="0.35">
            <circle cx="34" cy="36" r="5" />
            <circle cx="66" cy="62" r="7" />
            <circle cx="60" cy="30" r="3" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className={`absolute inset-0 h-full w-full ${spin ? 'animate-spin-slow' : ''}`}>
          <polygon points={OUTER} fill={ring} stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={INNER} fill={fill} stroke="var(--color-ink)" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
      {decor}
      <div className="burst-content relative text-center">{children}</div>
    </div>
  );
}

export function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const skin = useSkin();
  if (size === 'sm') {
    return (
      <span className="logo-sm comic text-3xl leading-none [text-shadow:2px_2px_0_var(--color-zap)]">
        <span className="logo-ka text-xl text-boom">ka</span>
        <span className="logo-main text-pow">BINGO!</span>
      </span>
    );
  }
  if (skin.logo === 'gothic') {
    return (
      <div className="relative mx-auto grid w-[min(92vw,30rem)] animate-pop-in place-items-center py-6">
        <GothicFlourish />
        <h1 className="relative text-center leading-[0.85]" style={{ fontFamily: 'Cinzel, serif' }}>
          <span
            className="block -rotate-3 text-[min(12vw,3.4rem)] italic text-[#b3202f] [text-shadow:0_2px_8px_rgb(0_0_0/0.7)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 }}
          >
            ka
          </span>
          <span className="block text-[min(21vw,6.4rem)] font-black tracking-[0.04em] text-[#ece4d4] [text-shadow:0_2px_0_#5e0f18,0_6px_18px_rgb(0_0_0/0.8)]">
            BINGO!
          </span>
        </h1>
      </div>
    );
  }
  return (
    <Burst className="mx-auto aspect-square w-[min(88vw,26rem)] animate-pop-in" decor={skin.logoLeaves ? <LogoLeaves /> : null}>
      <h1 className="comic -rotate-6 leading-[0.8] [text-shadow:3px_3px_0_var(--color-ink)]">
        <span className="logo-ka block text-[min(11vw,3.2rem)] text-boom">ka</span>
        <span className="block text-[min(19vw,5.6rem)] text-white [-webkit-text-stroke:2px_var(--color-ink)]">
          BINGO!
        </span>
      </h1>
    </Burst>
  );
}
