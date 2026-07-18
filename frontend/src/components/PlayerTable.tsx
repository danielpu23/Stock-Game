import type { PlayerState } from "../types/game";

interface PlayerTableProps {
  players: PlayerState[];
}

export default function PlayerTable({ players }: PlayerTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Cash</th>
          <th>Portfolio Value</th>
        </tr>
      </thead>

      <tbody>
        {players.map((player) => (
          <tr key={player.username}>
            <td>{player.username}</td>
            <td>${player.cashBalance.toFixed(2)}</td>
            <td>${player.portfolioValue.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
