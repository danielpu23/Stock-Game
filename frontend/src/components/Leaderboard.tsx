import type { GameResult } from "../types/result";
import { directionClass, money, signedMoney } from "../utils/format";

interface LeaderboardProps {
  leaderboard: GameResult[];
  /** Highlights this player's row. */
  currentUsername?: string;
  showBreakdown?: boolean;
}

export default function Leaderboard({
  leaderboard,
  currentUsername,
  showBreakdown = true,
}: LeaderboardProps) {
  if (leaderboard.length === 0) {
    return <p className="empty">No players yet.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            {showBreakdown && <th className="num">Cash</th>}
            {showBreakdown && <th className="num">Holdings</th>}
            <th className="num">Total</th>
            <th className="num">P/L</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((result) => (
            <tr
              key={result.username}
              className={result.username === currentUsername ? "is-you" : undefined}
            >
              <td>
                {/* rank comes from the server now, not the row index */}
                <span className={`rank rank--${result.rank}`}>{result.rank}</span>
              </td>
              <td>
                {result.username}
                {result.username === currentUsername && (
                  <span className="dim small"> (you)</span>
                )}
              </td>
              {showBreakdown && <td className="num">{money(result.cashBalance)}</td>}
              {showBreakdown && <td className="num">{money(result.holdingsValue)}</td>}
              <td className="num">{money(result.totalValue)}</td>
              <td className={`num ${directionClass(result.profitLoss)}`}>
                {signedMoney(result.profitLoss)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
