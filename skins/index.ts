// The kaBINGO! skin library. Each skin is:
//   - an entry here (name, colors for the browser bar and confetti, small art choices)
//   - a stylesheet in styles/skins/<id>.css, scoped to html[data-skin="<id>"]
//   - optional artwork in public/skins/<id>/
// To change which skin is live, edit skin.config.ts and push.

export type SkinId = 'classic' | 'fall';

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  /** Browser/OS toolbar color on phones. */
  themeColor: string;
  confetti: string[];
  /** What the free square in the middle of every card shows. */
  freeSpace: 'star' | 'pumpkin';
  /** Leaves drift down behind the app. */
  fallingLeaves: boolean;
  /** Leaves tucked around the big logo burst. */
  logoLeaves: boolean;
}

export const SKINS: Record<SkinId, Skin> = {
  classic: {
    id: 'classic',
    name: 'Classic comic',
    description: 'The original: halftone dots, bold ink outlines, red, yellow and blue.',
    themeColor: '#ffd60a',
    confetti: ['#e63946', '#ffd60a', '#1d6fd8', '#2a9d8f', '#ffffff'],
    freeSpace: 'star',
    fallingLeaves: false,
    logoLeaves: false,
  },
  fall: {
    id: 'fall',
    name: 'Fall harvest',
    description: 'Sunset over an autumn valley: maple leaves, pumpkins, wood signs and parchment cards.',
    themeColor: '#b5401b',
    confetti: ['#b3261e', '#f0a020', '#d9661f', '#7a8b2e', '#fff3d6'],
    freeSpace: 'pumpkin',
    fallingLeaves: true,
    logoLeaves: true,
  },
};

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && value in SKINS;
}
