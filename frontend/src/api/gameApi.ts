import api from "./axios";

export async function getGame(gameId: number) {
  const response = await api.get(`/games/${gameId}`);
  return response.data;
}
