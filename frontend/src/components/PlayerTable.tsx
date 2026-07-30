import type { PlayerState } from "../types/game";
import { money } from "../utils/format";

interface PlayerTableProps {
  players: PlayerState[];
  currentUsername?: string;
}

export default function PlayerTable({ players, currentUsername }: PlayerTableProps) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Player</th>
            <th className="num">Cash</th>
            <th className="num">Holdings</th>
            <th className="num">Net Worth</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => (
            <tr
              key={player.username}
              className={player.username === currentUsername ? "is-you" : undefined}
            >
              <td>
                {player.username}
                {player.username === currentUsername && (
                  <span className="dim small"> (you)</span>
                )}
              </td>
              <td className="num">{money(player.cashBalance)}</td>
              <td className="num">{money(player.portfolioValue)}</td>
              <td className="num">
                {money(player.cashBalance + player.portfolioValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
