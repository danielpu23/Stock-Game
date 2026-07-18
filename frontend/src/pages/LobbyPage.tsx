import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Game } from "../types/game";

import { getGame, startGame } from "../api/gameApi";

import PlayerTable from "../components/PlayerTable";

export default function LobbyPage() {
  const [game, setGame] = useState<Game | null>(null);

  const { gameId } = useParams();

  const navigate = useNavigate();

  const GAME_ID = Number(gameId);

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await getGame(GAME_ID);

        setGame(response);
      } catch (error) {
        console.error(error);
      }
    }

    loadGame();
  }, [GAME_ID]);

  async function handleStartGame() {
    try {
      await startGame(GAME_ID);

      navigate(`/game/${GAME_ID}`);
    } catch (error) {
      console.error(error);
    }
  }

  if (game == null) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{game.name}</h1>

      <h2>Lobby</h2>

      <p>
        <strong>Invite Code:</strong> {game.inviteCode}
      </p>

      <p>
        <strong>Status:</strong> {game.status}
      </p>

      <h3>Players</h3>

      <PlayerTable
        players={game.players.map((player) => ({
          username: player.username,
          cashBalance: player.cashBalance,
          portfolioValue: player.cashBalance,
          holdings: [],
        }))}
      />

      {game.status === "WAITING" && (
        <button onClick={handleStartGame}>Start Game</button>
      )}

      {game.status !== "WAITING" && <p>Game has already started.</p>}
    </div>
  );
}
