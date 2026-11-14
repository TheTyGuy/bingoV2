import type { CardSize, Pattern } from './bingo';

export type Phase = 'setup' | 'playing' | 'voting' | 'won';

export interface Prompt {
  id: string;
  text: string;
  /** Player id of whoever added it, or "pack:<id>" for starter prompts. */
  by: string;
}

export interface Claim {
  playerId: string;
  /** The caller's marks frozen at the moment they called it. */
  marks: number[];
  /** Epoch ms when voting closes. */
  deadline: number;
  /** voterId -> true (legit) / false (nope) */
  votes: Record<string, boolean>;
}

export interface RoundResult {
  round: number;
  playerId: string;
  approved: boolean;
  at: number;
}

export interface Game {
  code: string;
  hostId: string;
  phase: Phase;
  size: CardSize;
  pattern: Pattern;
  prompts: Prompt[];
  /** Image shown in the free space, or null for the default star. */
  freeImage: string | null;
  round: number;
  claim: Claim | null;
  lastResult: RoundResult | null;
  /** playerId -> rounds won */
  scores: Record<string, number>;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  /** Round the current card belongs to; a new round deals a new card. */
  round: number;
  /** Prompt ids, with FREE in the center. Empty until cards are dealt. */
  card: string[];
  /** Marked square indices, in the order they were marked. */
  marks: number[];
}
