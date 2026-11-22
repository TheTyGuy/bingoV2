// Skin-specific artwork that needs markup (the rest is pure CSS in styles/skins).
import { useSkin } from '@/lib/useSkin';

const LEAF = 'M50 4 L58 27 L75 17 L70 40 L93 37 L78 55 L89 62 L62 66 L66 86 L52 74 L50 96 L48 74 L34 86 L38 66 L11 62 L22 55 L7 37 L30 40 L25 17 L42 27Z';

/** The skin's moving background layer: falling leaves, drifting fog, or nothing. */
export function Ambient() {
  const skin = useSkin();
  if (skin.ambient === 'leaves') return <FallingLeaves />;
  if (skin.ambient === 'mist') return <DriftingMist />;
  return null;
}

/** Fog banks drifting slowly behind the app. */
function DriftingMist() {
  const banks = [
    [18, 0, 38],
    [46, 7, 52],
    [70, 3, 44],
    [88, 11, 60],
  ];
  return (
    <div className="drifting-mist" aria-hidden>
      {banks.map(([top, delay, duration], i) => (
        <span key={i} style={{ top: `${top}%`, animationDelay: `-${delay}s`, animationDuration: `${duration}s` }} />
      ))}
    </div>
  );
}

/** Leaves drifting down behind the app (fixed, behind all content, hidden for reduced motion). */
function FallingLeaves() {
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

/** Crimson ribbon swirls and a lily behind the gothic logo. */
export function GothicFlourish() {
  return (
    <svg aria-hidden viewBox="0 0 400 220" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <g fill="none" stroke="#9b1c2a" strokeLinecap="round">
        <path d="M10 150 C80 90 160 200 240 140 S360 70 395 110" strokeWidth="5" opacity="0.9" />
        <path d="M30 175 C110 130 190 215 270 165 S370 120 390 140" strokeWidth="2.5" opacity="0.7" />
        <path d="M60 95 C120 60 170 120 220 95" strokeWidth="2" opacity="0.55" />
        <path d="M18 150 c-14 -10 -10 -30 8 -28" strokeWidth="3" />
        <path d="M388 112 c14 -4 16 18 0 22" strokeWidth="3" />
      </g>
      <g transform="translate(352 40) rotate(20)">
        <path d="M0 0 Q-40 -8 -58 -32 Q-26 -28 0 0Z" fill="#9b1c2a" />
        <path d="M0 0 Q-20 -40 -6 -70 Q10 -36 0 0Z" fill="#b3202f" />
        <path d="M0 0 Q28 -34 62 -40 Q38 -12 0 0Z" fill="#9b1c2a" />
        <path d="M0 0 Q40 6 56 32 Q24 24 0 0Z" fill="#7d1520" />
        <path d="M0 0 Q-34 14 -46 40 Q-16 26 0 0Z" fill="#8a1824" />
        <g stroke="#f1d6d6" strokeWidth="1.5" opacity="0.6" fill="none">
          <path d="M0 0 Q-14 -34 -6 -64" />
          <path d="M0 0 Q30 -24 58 -38" />
        </g>
        <g stroke="#e7c36a" strokeWidth="1.5">
          <path d="M0 0 L-8 -26" />
          <path d="M0 0 L10 -24" />
        </g>
        <path d="M-4 8 Q-20 40 -12 70" stroke="#24391f" strokeWidth="4" fill="none" />
      </g>
    </svg>
  );
}

/** Full moon over pines, for the free square in the twilight skin. */
export function MoonSpace() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-label="Free space">
      <defs>
        <linearGradient id="free-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2126" />
          <stop offset="1" stopColor="#44505a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#free-night)" />
      <circle cx="50" cy="38" r="22" fill="#efe9da" />
      <g fill="#c9c1ac" opacity="0.5">
        <circle cx="43" cy="33" r="4" />
        <circle cx="57" cy="44" r="5" />
      </g>
      <g fill="#0d1013">
        <polygon points="8,100 18,62 28,100" />
        <polygon points="22,100 34,54 46,100" />
        <polygon points="70,100 82,58 94,100" />
        <polygon points="58,100 66,72 74,100" />
      </g>
      <text x="50" y="86" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="700" fontSize="14" letterSpacing="2" fill="#ece4d4">
        FREE
      </text>
    </svg>
  );
}

/** Red apple mark for a tapped square in the twilight skin. */
export function AppleStamp() {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="animate-stamp pointer-events-none absolute inset-[6%] h-[88%] w-[88%]">
      <path
        d="M50 30 C40 20 14 22 12 48 C10 74 30 96 42 94 C46 93 48 91 50 91 C52 91 54 93 58 94 C70 96 90 74 88 48 C86 22 60 20 50 30Z"
        fill="#b3202f"
        fillOpacity="0.32"
        stroke="#8e1b24"
        strokeWidth="3.5"
      />
      <path d="M50 30 Q50 18 56 8" stroke="#3b2414" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M54 16 Q70 4 82 12 Q68 24 54 16Z" fill="#3f6b4f" />
    </svg>
  );
}
