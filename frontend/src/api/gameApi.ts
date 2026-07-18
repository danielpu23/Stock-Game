import api from "./axios";

import type { Game, GameState } from "../types/game";
import type { Transaction } from "../types/transaction";
import type { GameResult } from "../types/result";

export async function getGame(id: number): Promise<Game> {
  const response = await api.get(`/games/${id}`);
  return response.data;
}

export async function getGameState(id: number): Promise<GameState> {
  const response = await api.get(`/games/${id}/state`);
  return response.data;
}

export async function getTransactions(
  playerSessionId: number,
): Promise<Transaction[]> {
  const response = await api.get(
    `/games/players/${playerSessionId}/transactions`,
  );

  return response.data;
}

export async function getResults(gameId: number): Promise<GameResult[]> {
  const response = await api.get(`/games/${gameId}/results`);

  return response.data;
}

export async function buyStock(
  gameId: number,
  userId: number,
  symbol: string,
  quantity: number,
): Promise<void> {
  await api.post(`/games/${gameId}/buy`, {
    userId,
    symbol,
    quantity,
  });
}

export async function sellStock(
  gameId: number,
  userId: number,
  symbol: string,
  quantity: number,
): Promise<void> {
  await api.post(`/games/${gameId}/sell`, { userId, symbol, quantity });
}

export async function createGame(
  userId: number,
  name: string,
  initialCash: number,
): Promise<Game> {
  const response = await api.post("/games", {
    userId,
    name,
    initialCash,
  });
  return response.data;
}

export async function joinGame(
  userId: number,
  inviteCode: string,
): Promise<void> {
  await api.post("/games/join", {
    userId,
    inviteCode,
  });
}

export async function startGame(gameId: number): Promise<Game> {
  const response = await api.post(`/games/${gameId}/start`);
  return response.data;
}
