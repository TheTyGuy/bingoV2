// Pure game logic: no React, no backend. Covered by lib/bingo.test.ts.

export type CardSize = 3 | 5 | 7;
export type Pattern = 'line' | 'corners' | 'x' | 'blackout';

export const FREE = '*';

export const CARD_SIZES: { size: CardSize; label: string }[] = [
  { size: 3, label: 'Quick (3×3)' },
  { size: 5, label: 'Classic (5×5)' },
  { size: 7, label: 'Marathon (7×7)' },
];

export const PATTERNS: { id: Pattern; label: string; hint: string }[] = [
  { id: 'line', label: 'Any line', hint: 'A full row, column or diagonal' },
  { id: 'corners', label: 'Four corners', hint: 'All four corner squares' },
  { id: 'x', label: 'Big X', hint: 'Both diagonals' },
  { id: 'blackout', label: 'Blackout', hint: 'Every single square' },
];

/** Prompts needed to fill a card: every square except the free center. */
export function promptsNeeded(size: number): number {
  return size * size - 1;
}

export function centerIndex(size: number): number {
  return Math.floor((size * size) / 2);
}

/** Unbiased Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Build a card of prompt ids with the free space in the center. */
export function makeCard(promptIds: readonly string[], size: number, random?: () => number): string[] {
  const needed = promptsNeeded(size);
  if (promptIds.length < needed) {
    throw new Error(`Need ${needed} prompts for a ${size}×${size} card, have ${promptIds.length}`);
  }
  const picks = shuffle(promptIds, random).slice(0, needed);
  picks.splice(centerIndex(size), 0, FREE);
  return picks;
}

/** All index groups that, when fully marked, satisfy the pattern. */
export function patternGroups(size: number, pattern: Pattern): number[][] {
  const idx = (r: number, c: number) => r * size + c;
  const range = [...Array(size).keys()];
  const diagA = range.map((i) => idx(i, i));
  const diagB = range.map((i) => idx(i, size - 1 - i));
  switch (pattern) {
    case 'line':
      return [
        ...range.map((r) => range.map((c) => idx(r, c))),
        ...range.map((c) => range.map((r) => idx(r, c))),
        diagA,
        diagB,
      ];
    case 'corners':
      return [[idx(0, 0), idx(0, size - 1), idx(size - 1, 0), idx(size - 1, size - 1)]];
    case 'x':
      return [[...new Set([...diagA, ...diagB])]];
    case 'blackout':
      return [[...Array(size * size).keys()]];
  }
}

function markedSet(marks: readonly number[], size: number): Set<number> {
  const set = new Set(marks);
  set.add(centerIndex(size)); // the free space is always marked
  return set;
}

/**
 * Fewest additional squares this player needs to win (0 = they have it).
 * Struck squares can never be marked, so any group containing one is out;
 * Infinity means there is no way left to win this round.
 */
export function squaresToWin(
  marks: readonly number[],
  size: number,
  pattern: Pattern,
  struck: readonly number[] = [],
): number {
  const set = markedSet(marks, size);
  const blocked = new Set(struck);
  const open = patternGroups(size, pattern).filter((g) => !g.some((i) => blocked.has(i)));
  if (open.length === 0) return Infinity;
  return Math.min(...open.map((g) => g.filter((i) => !set.has(i)).length));
}

/** Indices of the first completed winning group, or [] if none. */
export function winningCells(marks: readonly number[], size: number, pattern: Pattern): number[] {
  const set = markedSet(marks, size);
  return patternGroups(size, pattern).find((g) => g.every((i) => set.has(i))) ?? [];
}

export function hasWon(marks: readonly number[], size: number, pattern: Pattern): boolean {
  return squaresToWin(marks, size, pattern) === 0;
}

/**
 * Decide a kaBINGO! vote. Everyone except the caller votes.
 * - Resolves early once every voter has voted, or once the deadline passes.
 * - Majority wins; a tie or silence goes to the caller (nobody objected).
 * Returns null while the vote is still open.
 */
export function voteOutcome(
  votes: Record<string, boolean>,
  voterIds: readonly string[],
  deadlinePassed: boolean,
): 'approved' | 'rejected' | null {
  const cast = voterIds.filter((id) => id in votes);
  if (!deadlinePassed && cast.length < voterIds.length) return null;
  const yes = cast.filter((id) => votes[id]).length;
  const no = cast.length - yes;
  return yes >= no ? 'approved' : 'rejected';
}

export interface Vote {
  legit: boolean;
  /** Squares this voter says didn't happen (only for legit = false). */
  flagged: number[];
}

/**
 * After a rejected call, which of the caller's squares get struck out:
 * any square flagged by at least half of the "no" voters.
 */
export function struckFromVotes(votes: Record<string, Vote>): number[] {
  const nos = Object.values(votes).filter((v) => !v.legit);
  const counts = new Map<number, number>();
  for (const v of nos) for (const i of new Set(v.flagged)) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts].filter(([, n]) => n * 2 >= nos.length).map(([i]) => i).sort((a, b) => a - b);
}

interface PromptLike {
  id: string;
  by: string;
  /** The game round when it was added (0 = before the first deal). */
  round?: number;
}

/**
 * With the host's "hide predictions" option on, you only see your own
 * predictions until they've been played in a round.
 */
export function promptVisible(prompt: PromptLike, viewerId: string, showPrompts: boolean, round: number): boolean {
  return showPrompts || prompt.by === viewerId || (prompt.round ?? 0) < round;
}

/** Prompts that may go on this player's card. Hidden mode leaves out their own. */
export function eligiblePrompts<T extends PromptLike>(prompts: readonly T[], playerId: string, hidden: boolean): T[] {
  return hidden ? prompts.filter((p) => p.by !== playerId) : [...prompts];
}

/** Players who wouldn't have enough predictions to fill a card. Empty = ready to deal. */
export function dealShortfall(
  prompts: readonly PromptLike[],
  playerIds: readonly string[],
  size: number,
  hidden: boolean,
): { playerId: string; have: number }[] {
  const needed = promptsNeeded(size);
  const ids = hidden ? playerIds : playerIds.slice(0, 1);
  return ids
    .map((playerId) => ({ playerId, have: eligiblePrompts(prompts, playerId, hidden).length }))
    .filter((s) => s.have < needed);
}

const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O, too easy to confuse

export function makeGameCode(random: () => number = Math.random): string {
  return Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)]).join('');
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}
