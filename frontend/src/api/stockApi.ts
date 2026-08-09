import api from "./axios";

export async function getStockPrice(symbol: string): Promise<number> {
  const response = await api.get(`/stocks/${symbol.toUpperCase()}`);
  return response.data;
}