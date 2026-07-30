import type { GameResult } from "../types/result";

interface LeaderboardProps {
  leaderboard: GameResult[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Leaderboard</h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Rank</th>
            <th style={{ padding: "8px", textAlign: "left" }}>Username</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Cash</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Holdings</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((result, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px" }}>{index + 1}</td>
              <td style={{ padding: "8px" }}>{result.username}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                ${result.cashBalance.toFixed(2)}
              </td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                ${result.holdingsValue.toFixed(2)}
              </td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                ${result.totalValue.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}