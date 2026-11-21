// Skin-specific artwork that needs markup (the rest is pure CSS in styles/skins).
import { useSkin } from '@/lib/useSkin';

const LEAF = 'M50 4 L58 27 L75 17 L70 40 L93 37 L78 55 L89 62 L62 66 L66 86 L52 74 L50 96 L48 74 L34 86 L38 66 L11 62 L22 55 L7 37 L30 40 L25 17 L42 27Z';

/** Leaves drifting down behind the app (fixed, behind all content, hidden for reduced motion). */
export function FallingLeaves() {
  const skin = useSkin();
  if (!skin.fallingLeaves) return null;
  // Fixed positions/timings so server and browser render the same thing.
  const leaves = [
    [4, 22, 0, 13], [14, 30, 6, 17], [26, 18, 2, 12], [38, 26, 9, 19], [52, 20, 4, 15],
    [63, 34, 11, 21], [74, 22, 1, 14], [85, 28, 7, 18], [94, 18, 13, 16], [46, 16, 15, 13],
  ];
  return (
    <div className="falling-leaves" aria-hidden>
      {leaves.map(([left, size, delay, duration], i) => (
        <span
          key={i}
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            filter: i % 3 === 0 ? 'hue-rotate(-25deg) saturate(1.2)' : i % 3 === 1 ? 'hue-rotate(18deg)' : undefined,
          }}
        />
      ))}
    </div>
  );
}

/** Maple leaves tucked around the big logo burst. */
export function LogoLeaves() {
  const spots = [
    { x: 3, y: 14, s: 24, r: -30, c: '#b3261e' },
    { x: 74, y: 2, s: 22, r: 20, c: '#d9661f' },
    { x: 84, y: 40, s: 18, r: 60, c: '#f0a020' },
    { x: 0, y: 58, s: 18, r: -70, c: '#f0a020' },
    { x: 60, y: 78, s: 22, r: 150, c: '#b3261e' },
    { x: 14, y: 80, s: 16, r: 200, c: '#d9661f' },
  ];
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {spots.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s / 100}) rotate(${l.r} 50 50)`}>
          <path d={LEAF} fill={l.c} stroke="#5a2410" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 30 V96 M50 60 L30 44 M50 60 L70 44" stroke="#5a2410" strokeWidth="3" fill="none" />
        </g>
      ))}
    </svg>
  );
}

/** Pumpkin for the free square in the fall skin. */
export function Pumpkin() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-label="Free space">
      <rect width="100" height="100" fill="#6f8a2a" />
      <g stroke="#5a2410" strokeWidth="2.5">
        <ellipse cx="34" cy="58" rx="19" ry="23" fill="#d9661f" />
        <ellipse cx="66" cy="58" rx="19" ry="23" fill="#d9661f" />
        <ellipse cx="50" cy="58" rx="19" ry="25" fill="#ef8a2e" />
      </g>
      <path d="M50 34 Q52 22 60 18" stroke="#3f4a14" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text x="50" y="66" textAnchor="middle" fontFamily="'Luckiest Guy', Bangers, Impact, sans-serif" fontSize="17" fill="#fff3d6" stroke="#5a2410" strokeWidth="1">
        FREE
      </text>
    </svg>
  );
}
