import type { CardSize, Pattern, Vote } from './bingo';

export type Phase = 'setup' | 'playing' | 'voting' | 'won';

export interface Prompt {
  id: string;
  text: string;
  /** Player id of whoever added it, or "pack:<id>" for starter prompts. */
  by: string;
  /** Game round when it was added (0 = before the first deal). */
  round?: number;
}

export interface Claim {
  playerId: string;
  /** The caller's marks frozen at the moment they called it. */
  marks: number[];
  /** The squares that make up the winning pattern. */
  cells: number[];
  /** Epoch ms when voting closes. */
  deadline: number;
  /** voterId -> their vote */
  votes: Record<string, Vote>;
}

export interface RoundResult {
  round: number;
  playerId: string;
  approved: boolean;
  /** Squares struck out by a rejected vote. */
  struck: number[];
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
  /** Host option: everyone sees all predictions before the deal. Off = you only see your own, and never get them on your card. */
  showPrompts: boolean;
  /** Host option: show a shared list of every square anyone marks during the round. */
  showCalls: boolean;
  /** playerId -> squares struck out by rejected calls this round. */
  struck: Record<string, number[]>;
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
  /** Marked square indices. */
  marks: number[];
  /** promptId -> when this player marked it (for the shared "called" list). */
  markedAt: Record<string, number>;
  /** The round this player said they're ready for, on the score screen. */
  readyRound: number;
}
