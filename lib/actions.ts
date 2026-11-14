import { backend } from './backend';
import { FREE, hasWon, makeCard, makeGameCode, promptsNeeded, voteOutcome, type CardSize, type Pattern } from './bingo';
import { PACKS } from './packs';
import type { Game, Player } from './types';

export const VOTE_SECONDS = 30;
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
  return { id, name, color, joinedAt: Date.now(), round: 0, card: [], marks: [] };
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
    return { ...g, prompts: [...g.prompts, { id: newId(), text, by }] };
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
      prompts: [...g.prompts, ...fresh.map((text) => ({ id: newId(), text, by: `pack:${pack.id}` }))],
      freeImage: pack.freeImage ?? g.freeImage,
    };
  });
  return added;
}

export const clearPrompts = (code: string) =>
  backend.updateGame(code, (g) => ({ ...g, prompts: [], freeImage: null }));

export const updateSettings = (code: string, settings: { size?: CardSize; pattern?: Pattern }) =>
  backend.updateGame(code, (g) => (g.phase === 'setup' ? { ...g, ...settings } : null));

export const startGame = (code: string) =>
  backend.updateGame(code, (g) => {
    if (g.phase !== 'setup' || g.prompts.length < promptsNeeded(g.size)) return null;
    return { ...g, phase: 'playing', round: g.round + 1, claim: null, lastResult: null };
  });

/** Deal this player a fresh card for the current round. */
export function dealCard(game: Game, playerId: string) {
  const card = makeCard(
    game.prompts.map((p) => p.id),
    game.size,
  );
  return backend.updatePlayer(game.code, playerId, { round: game.round, card, marks: [] });
}

export function toggleMark(game: Game, player: Player, index: number) {
  if (game.phase !== 'playing' || player.card[index] === FREE) return;
  const marks = player.marks.includes(index) ? player.marks.filter((i) => i !== index) : [...player.marks, index];
  return backend.updatePlayer(game.code, player.id, { marks });
}

export const callBingo = (game: Game, player: Player) =>
  backend.updateGame(game.code, (g) => {
    if (g.phase !== 'playing' || player.round !== g.round || !hasWon(player.marks, g.size, g.pattern)) return null;
    return {
      ...g,
      phase: 'voting',
      claim: { playerId: player.id, marks: player.marks, deadline: Date.now() + VOTE_SECONDS * 1000, votes: {} },
    };
  });

export const castVote = (code: string, voterId: string, legit: boolean) =>
  backend.updateGame(code, (g) => {
    if (g.phase !== 'voting' || !g.claim || g.claim.playerId === voterId) return null;
    return { ...g, claim: { ...g.claim, votes: { ...g.claim.votes, [voterId]: legit } } };
  });

/** Any client may call this; the transaction makes sure it only resolves once. */
export const resolveVote = (code: string, playerIds: string[]) =>
  backend.updateGame(code, (g) => {
    if (g.phase !== 'voting' || !g.claim) return null;
    const claim = g.claim;
    const voters = playerIds.filter((id) => id !== claim.playerId);
    const outcome = voteOutcome(claim.votes, voters, Date.now() >= claim.deadline);
    if (!outcome) return null;
    const lastResult = { round: g.round, playerId: claim.playerId, approved: outcome === 'approved', at: Date.now() };
    if (outcome === 'approved') {
      return {
        ...g,
        phase: 'won',
        lastResult,
        scores: { ...g.scores, [claim.playerId]: (g.scores[claim.playerId] ?? 0) + 1 },
      };
    }
    return { ...g, phase: 'playing', claim: null, lastResult };
  });

export const nextRound = (code: string) =>
  backend.updateGame(code, (g) =>
    g.phase === 'won' ? { ...g, phase: 'playing', round: g.round + 1, claim: null, lastResult: null } : null,
  );

export const backToSetup = (code: string) =>
  backend.updateGame(code, (g) => ({ ...g, phase: 'setup', claim: null, lastResult: null }));
