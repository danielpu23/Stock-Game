import type { PlayerState } from "../types/game";
import type { Player } from "../types/player";

interface PlayerTableProps {
  players: PlayerState[] | Player[];
}

export default function PlayerTable({ players }: PlayerTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Player</th>
          <th>Cash</th>
          <th>Portfolio Value</th>
        </tr>
      </thead>

      <tbody>
        {players.map((player) => {
          const isPlayerState = 'portfolioValue' in player;
          const playerState = isPlayerState ? player as PlayerState : null;
          return (
            <tr key={player.playerSessionId || player.username}>
              <td>{player.username}</td>
              <td>${player.cashBalance.toFixed(2)}</td>
              <td>${playerState ? playerState.portfolioValue.toFixed(2) : player.cashBalance.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
