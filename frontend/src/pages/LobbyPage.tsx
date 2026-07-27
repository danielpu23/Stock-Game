import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Game } from "../types/game";

import { getGame, startGame } from "../api/gameApi";

import PlayerTable from "../components/PlayerTable";
import Navbar from "../components/Navbar";

export default function LobbyPage() {
  const [game, setGame] = useState<Game | null>(null);

  const { gameId } = useParams();

  const navigate = useNavigate();

  const GAME_ID = Number(gameId);

  async function loadGame() {
    try {
      const response = await getGame(GAME_ID);

      setGame(response);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadGame();

    const interval = setInterval(loadGame, 3000);

    return () => clearInterval(interval);
  }, [GAME_ID]);

  async function handleStartGame() {
    try {
      await startGame(GAME_ID);

      navigate(`/games/${GAME_ID}`);
    } catch (error) {
      console.error(error);
    }
  }

  if (game == null) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>{game.name}</h1>

        <h2>Lobby</h2>

        <div>
          <h3>Invite Code</h3>

          <p>
            <strong>{game.inviteCode}</strong>
          </p>
        </div>

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

        <br />

        <button
          onClick={handleStartGame}
          disabled={game.status !== "WAITING"}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Start Game
        </button>

        {game.status !== "WAITING" && <p>Game has already started.</p>}
      </div>
    </div>
  );
}
