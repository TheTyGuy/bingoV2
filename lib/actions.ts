import { backend } from './backend';
import {
  FREE,
  dealShortfall,
  eligiblePrompts,
  hasWon,
  makeCard,
  makeGameCode,
  promptsNeeded,
  struckFromVotes,
  voteOutcome,
  winningCells,
  type CardSize,
  type Pattern,
  type Vote,
} from './bingo';
import { PACKS } from './packs';
import type { Game, Player } from './types';

export const VOTE_SECONDS = 45;
export const MAX_PROMPT_LENGTH = 60;
export const MAX_NAME_LENGTH = 20;

const PLAYER_COLORS = ['#e63946', '#1d6fd8', '#f4a300', '#2a9d8f', '#9b5de5', '#f15bb5', '#ff6b1a', '#3a86ff', '#06a77d', '#c1121f'];

const newId = () => Math.random().toString(36).slice(2, 10);

export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);

function pickColor(players: Player[]): string {
  const used = new Set(players.map((p) => p.color));
  return PLAYER_COLORS.find((c) => !used.has(c)) ?? PLAYER_COLORS[players.length % PLAYER_COLORS.length];
}

function newPlayer(id: string, name: string, color: string): Player {
  return { id, name, color, joinedAt: Date.now(), round: 0, card: [], marks: [], markedAt: {}, readyRound: 0 };
}

/** Fill in fields added after a game was created, so older games keep working. */
export function withDefaults(g: Game): Game {
  return { ...g, showPrompts: g.showPrompts ?? true, showCalls: g.showCalls ?? true, struck: g.struck ?? {} };
}

export async function createGame(rawName: string): Promise<string> {
  const name = cleanName(rawName);
  if (!name) throw new Error('Pick a name first.');
  const uid = await backend.getUserId();
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = makeGameCode();
    const game: Game = {
      code,
      hostId: uid,
      phase: 'setup',
      size: 5,
      pattern: 'line',
      prompts: [],
      freeImage: null,
      showPrompts: true,
      showCalls: true,
      struck: {},
      round: 0,
      claim: null,
      lastResult: null,
      scores: {},
      createdAt: Date.now(),
    };
    if (await backend.createGame(game)) {
      await backend.setPlayer(code, newPlayer(uid, name, PLAYER_COLORS[0]));
      return code;
    }
  }
  throw new Error('Could not find a free game code. Try again.');
}

export async function joinGame(code: string, rawName: string): Promise<void> {
  const name = cleanName(rawName);
  if (!name) throw new Error('Pick a name first.');
  const [uid, game, players] = await Promise.all([backend.getUserId(), backend.getGame(code), backend.getPlayers(code)]);
  if (!game) throw new Error(`No game with code ${code}.`);
  const taken = players.find((p) => p.id !== uid && p.name.toLowerCase() === name.toLowerCase());
  if (taken) throw new Error(`Someone is already called "${taken.name}". Try another name.`);
  const existing = players.find((p) => p.id === uid);
  if (existing) await backend.updatePlayer(code, uid, { name });
  else await backend.setPlayer(code, newPlayer(uid, name, pickColor(players)));
}

export async function leaveGame(code: string, uid: string): Promise<void> {
  await backend.removePlayer(code, uid);
  const remaining = await backend.getPlayers(code);
  await backend.updateGame(code, (g) => {
    if (g.hostId !== uid || remaining.length === 0) return null;
    return { ...g, hostId: remaining[0].id }; // hand host duties to the longest-standing player
  });
}

export const kickPlayer = (code: string, id: string) => backend.removePlayer(code, id);

export async function addPrompt(code: string, by: string, rawText: string): Promise<'added' | 'duplicate' | 'empty'> {
  const text = rawText.trim().replace(/\s+/g, ' ').slice(0, MAX_PROMPT_LENGTH);
  if (!text) return 'empty';
  let result: 'added' | 'duplicate' = 'added';
  await backend.updateGame(code, (g) => {
    if (g.prompts.some((p) => p.text.toLowerCase() === text.toLowerCase())) {
      result = 'duplicate';
      return null;
    }
    return { ...g, prompts: [...g.prompts, { id: newId(), text, by, round: g.round }] };
  });
  return result;
}

export const removePrompt = (code: string, promptId: string) =>
  backend.updateGame(code, (g) => ({ ...g, prompts: g.prompts.filter((p) => p.id !== promptId) }));

export async function addPack(code: string, packId: string): Promise<number> {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack) return 0;
  let added = 0;
  await backend.updateGame(code, (g) => {
    const have = new Set(g.prompts.map((p) => p.text.toLowerCase()));
    const fresh = pack.prompts.filter((t) => !have.has(t.toLowerCase()));
    added = fresh.length;
    return {
      ...g,
      prompts: [...g.prompts, ...fresh.map((text) => ({ id: newId(), text, by: `pack:${pack.id}`, round: g.round }))],
      freeImage: pack.freeImage ?? g.freeImage,
    };
  });
  return added;
}

export const clearPrompts = (code: string) =>
  backend.updateGame(code, (g) => ({ ...g, prompts: [], freeImage: null }));

export interface Settings {
  size?: CardSize;
  pattern?: Pattern;
  showPrompts?: boolean;
  showCalls?: boolean;
}

/** Settings can change before the first deal and between rounds. */
export const updateSettings = (code: string, settings: Settings) =>
  backend.updateGame(code, (g) => (g.phase === 'setup' || g.phase === 'won' ? { ...g, ...settings } : null));

/** Deal a new round, from setup or the score screen. Every player gets a fresh card. */
export const dealRound = (code: string, playerIds: string[]) =>
  backend.updateGame(code, (raw) => {
    const g = withDefaults(raw);
    if (g.phase !== 'setup' && g.phase !== 'won') return null;
    if (dealShortfall(g.prompts, playerIds, g.size, !g.showPrompts).length > 0) return null;
    return { ...g, phase: 'playing', round: g.round + 1, claim: null, lastResult: null, struck: {} };
  });

/** Deal this player a fresh card for the current round. */
export function dealCard(game: Game, playerId: string) {
  const g = withDefaults(game);
  let pool = eligiblePrompts(g.prompts, playerId, !g.showPrompts);
  // A late joiner in hidden mode might not have enough; fall back to everything.
  if (pool.length < promptsNeeded(g.size)) pool = g.prompts;
  const card = makeCard(
    pool.map((p) => p.id),
    g.size,
  );
  return backend.updatePlayer(g.code, playerId, { round: g.round, card, marks: [], markedAt: {} });
}

export function setMark(game: Game, player: Player, index: number, on: boolean) {
  const promptId = player.card[index];
  const struck = withDefaults(game).struck[player.id] ?? [];
  if (game.phase !== 'playing' || !promptId || promptId === FREE) return;
  if (on && struck.includes(index)) return;
  return backend.markSquare(game.code, player.id, index, promptId, on);
}

export const toggleMark = (game: Game, player: Player, index: number) =>
  setMark(game, player, index, !player.marks.includes(index));

export const callBingo = (game: Game, player: Player) =>
  backend.updateGame(game.code, (g) => {
    if (g.phase !== 'playing' || player.round !== g.round || !hasWon(player.marks, g.size, g.pattern)) return null;
    return {
      ...g,
      phase: 'voting',
      claim: {
        playerId: player.id,
        marks: player.marks,
        cells: winningCells(player.marks, g.size, g.pattern),
        deadline: Date.now() + VOTE_SECONDS * 1000,
        votes: {},
      },
    };
  });

export const castVote = (code: string, voterId: string, vote: Vote) =>
  backend.updateGame(code, (g) => {
    if (g.phase !== 'voting' || !g.claim || g.claim.playerId === voterId) return null;
    return { ...g, claim: { ...g.claim, votes: { ...g.claim.votes, [voterId]: vote } } };
  });

/** Majority of the people who voted; ties and silence go to the caller. */
export function claimOutcome(claim: NonNullable<Game['claim']>, playerIds: string[], now: number) {
  const voters = playerIds.filter((id) => id !== claim.playerId);
  const legit = Object.fromEntries(Object.entries(claim.votes).map(([id, v]) => [id, v.legit]));
  return voteOutcome(legit, voters, now >= claim.deadline);
}

/** Any client may call this; the transaction makes sure it only resolves once. */
export const resolveVote = (code: string, playerIds: string[]) =>
  backend.updateGame(code, (raw) => {
    const g = withDefaults(raw);
    if (g.phase !== 'voting' || !g.claim) return null;
    const claim = g.claim;
    const outcome = claimOutcome(claim, playerIds, Date.now());
    if (!outcome) return null;
    const approved = outcome === 'approved';
    const struck = approved ? [] : struckFromVotes(claim.votes).filter((i) => claim.cells.includes(i));
    const lastResult = { round: g.round, playerId: claim.playerId, approved, struck, at: Date.now() };
    if (approved) {
      return {
        ...g,
        phase: 'won',
        lastResult,
        scores: { ...g.scores, [claim.playerId]: (g.scores[claim.playerId] ?? 0) + 1 },
      };
    }
    const already = g.struck[claim.playerId] ?? [];
    return {
      ...g,
      phase: 'playing',
      claim: null,
      lastResult,
      struck: { ...g.struck, [claim.playerId]: [...new Set([...already, ...struck])] },
    };
  });

/** On the score screen: "I'm in for the next round" (or not). */
export const setReady = (game: Game, playerId: string, ready: boolean) =>
  backend.updatePlayer(game.code, playerId, { readyRound: ready ? game.round + 1 : 0 });

export const backToSetup = (code: string) =>
  backend.updateGame(code, (g) => ({ ...g, phase: 'setup', claim: null, lastResult: null, struck: {} }));
