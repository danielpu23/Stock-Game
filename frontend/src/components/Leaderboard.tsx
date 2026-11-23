import type { GameResult } from "../types/result";

interface LeaderboardProps {
  leaderboard: GameResult[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <div className="mt-8">
      <h3>Leaderboard</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th className="text-right">Cash</th>
            <th className="text-right">Holdings</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((result, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{result.username}</td>
              <td className="text-right">
                ${result.cashBalance.toFixed(2)}
              </td>
              <td className="text-right">
                ${result.holdingsValue.toFixed(2)}
              </td>
              <td className="text-right">
                ${result.totalValue.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}