import type { Holding } from "../types/holding";

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Shares</th>
          <th>Average Price</th>
        </tr>
      </thead>

      <tbody>
        {holdings.map((holding) => (
          <tr key={holding.symbol}>
            <td>{holding.symbol}</td>
            <td>{holding.quantity}</td>
            <td>${holding.averagePrice.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
