// The kaBINGO! skin library. Each skin is:
//   - an entry here (name, colors for the browser bar and confetti, small art choices)
//   - a stylesheet in styles/skins/<id>.css, scoped to html[data-skin="<id>"]
//   - optional artwork in public/skins/<id>/
// To change which skin is live, edit skin.config.ts and push.

export type SkinId = 'classic' | 'fall' | 'twilight';

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  /** Browser/OS toolbar color on phones. */
  themeColor: string;
  confetti: string[];
  /** What the free square in the middle of every card shows. */
  freeSpace: 'star' | 'pumpkin' | 'moon';
  /** Moving layer behind the app: falling leaves, drifting fog, or nothing. */
  ambient: 'none' | 'leaves' | 'mist';
  /** Leaves tucked around the big logo burst. */
  logoLeaves: boolean;
  /** The big home-page logo: comic starburst, or gothic serif lettering. */
  logo: 'burst' | 'gothic';
  /** Shape behind "kaBINGO!" call-outs: a comic starburst or a full moon. */
  burstShape: 'star' | 'moon';
  /** Mark left on a square when you tap it. */
  stamp: 'circle' | 'apple';
}

export const SKINS: Record<SkinId, Skin> = {
  classic: {
    id: 'classic',
    name: 'Classic comic',
    description: 'The original: halftone dots, bold ink outlines, red, yellow and blue.',
    themeColor: '#ffd60a',
    confetti: ['#e63946', '#ffd60a', '#1d6fd8', '#2a9d8f', '#ffffff'],
    freeSpace: 'star',
    ambient: 'none',
    logoLeaves: false,
    logo: 'burst',
    burstShape: 'star',
    stamp: 'circle',
  },
  fall: {
    id: 'fall',
    name: 'Fall harvest',
    description: 'Sunset over an autumn valley: maple leaves, pumpkins, wood signs and parchment cards.',
    themeColor: '#b5401b',
    confetti: ['#b3261e', '#f0a020', '#d9661f', '#7a8b2e', '#fff3d6'],
    freeSpace: 'pumpkin',
    ambient: 'leaves',
    logoLeaves: true,
    logo: 'burst',
    burstShape: 'star',
    stamp: 'circle',
  },
  twilight: {
    id: 'twilight',
    name: 'Twilight forest',
    description:
      'Moonlit Pacific Northwest: misty pines, a snowy peak, a howling wolf, crimson lilies, gothic lettering and red-apple stamps.',
    themeColor: '#1a1f24',
    confetti: ['#9b1c2a', '#e9e1d2', '#b7bec4', '#5e0f18', '#3f6b4f'],
    freeSpace: 'moon',
    ambient: 'mist',
    logoLeaves: false,
    logo: 'gothic',
    burstShape: 'moon',
    stamp: 'apple',
  },
};

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && value in SKINS;
}
