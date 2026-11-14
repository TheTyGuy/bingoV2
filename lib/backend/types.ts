import type { Game, Player } from '../types';

export interface Backend {
  mode: 'firebase' | 'local';
  /** Stable id for this device/tab's player. */
  getUserId(): Promise<string>;
  /** Creates the game only if the code is free. Returns false on a collision. */
  createGame(game: Game): Promise<boolean>;
  getGame(code: string): Promise<Game | null>;
  /**
   * Transactionally read-modify-write the game. Return null from `fn` to abort.
   * Resolves to the written game, or null if aborted / missing.
   */
  updateGame(code: string, fn: (game: Game) => Game | null): Promise<Game | null>;
  watchGame(code: string, cb: (game: Game | null) => void): () => void;

  getPlayers(code: string): Promise<Player[]>;
  setPlayer(code: string, player: Player): Promise<void>;
  updatePlayer(code: string, id: string, patch: Partial<Player>): Promise<void>;
  removePlayer(code: string, id: string): Promise<void>;
  watchPlayers(code: string, cb: (players: Player[]) => void): () => void;
}
