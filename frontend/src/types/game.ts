import type { Player } from "./player";
import type { Holding } from "./holding";

export type GameStatus = "WAITING" | "IN_PROGRESS" | "FINISHED";

export interface Game {
  id: number;
  name: string;
  inviteCode: string;
  status: GameStatus;
  initialCash: number;
  createdByUsername: string;
  players: Player[];
}

/** One row of the "my games" list on the home page. */
export interface GameSummary {
  id: number;
  name: string;
  inviteCode: string;
  status: GameStatus;
  playerCount: number;
  cashBalance: number;
  joinedAt: string;
  createdByMe: boolean;
}

export interface GameState {
  gameId: number;
  status: GameStatus;
  players: PlayerState[];
}

export interface PlayerState {
  username: string;
  cashBalance: number;
  portfolioValue: number;
  holdings: Holding[];
}
