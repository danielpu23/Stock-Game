import type { Holding } from "../types/holding";
import { directionClass, money, signedMoney } from "../utils/format";

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return <p className="empty">No positions yet. Buy something to get started.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th className="num">Shares</th>
            <th className="num">Avg Cost</th>
            <th className="num">Price</th>
            <th className="num">Value</th>
            <th className="num">P/L</th>
          </tr>
        </thead>

        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol}>
              <td className="ticker">{holding.symbol}</td>
              <td className="num">{holding.quantity}</td>
              <td className="num">{money(holding.averagePrice)}</td>
              <td className="num">{money(holding.currentPrice)}</td>
              <td className="num">{money(holding.marketValue)}</td>
              <td className={`num ${directionClass(holding.profitLoss)}`}>
                {signedMoney(holding.profitLoss)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
