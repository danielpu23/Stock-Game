export interface Transaction {
  id: number;
  symbol: string;
  quantity: number;
  price: number;
  type: "BUY" | "SELL";
  createdAt: string;
}
