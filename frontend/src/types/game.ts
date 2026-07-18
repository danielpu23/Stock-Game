import type { Player } from "./player";
import type { Holding } from "./holding";

export interface Game {
  id: number;
  name: string;
  inviteCode: string;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED";
  players: Player[];
}

export interface GameState {
  gameId: number;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED";
  players: PlayerState[];
}

export interface PlayerState {
  username: string;
  cashBalance: number;
  portfolioValue: number;
  holdings: Holding[];
}
