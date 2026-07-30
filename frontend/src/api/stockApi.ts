import api from "./axios";

export async function getStockPrice(symbol: string): Promise<number> {
  const response = await api.get(`/stocks/${symbol}`);
  return response.data;
}