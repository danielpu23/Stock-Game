import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Game } from "../types/game";

import { getGame, startGame } from "../api/gameApi";

import PlayerTable from "../components/PlayerTable";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";
import Alert from "../components/ui/Alert";

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
    return (
      <Layout>
        <Navbar />
        <div style={{ padding: "2rem" }}>
          <h2>Loading...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#333", marginBottom: "0.5rem" }}>{game.name}</h1>
          <p style={{ color: "#666", margin: 0 }}>Lobby</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <Card title="Invite Code">
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#007bff", letterSpacing: "2px" }}>
              {game.inviteCode}
            </div>
          </Card>

          <Card title="Game Status">
            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#333" }}>
              {game.status}
            </div>
          </Card>
        </div>

        <Card title="Players" style={{ marginBottom: "1.5rem" }}>
          <PlayerTable
            players={game.players.map((player) => ({
              username: player.username,
              cashBalance: player.cashBalance,
              portfolioValue: player.cashBalance,
              holdings: [],
            }))}
          />
        </Card>

        <Button
          onClick={handleStartGame}
          disabled={game.status !== "WAITING"}
          variant="primary"
        >
          Start Game
        </Button>

        {game.status === "FINISHED" && (
          <Alert type="warning" style={{ marginTop: "1rem" }}>
            Game has finished. <Button as="a" href={`/games/${GAME_ID}/results`} variant="warning" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginLeft: "0.5rem" }}>View results</Button>
          </Alert>
        )}
        
        {game.status === "IN_PROGRESS" && (
          <Alert type="info" style={{ marginTop: "1rem" }}>
            Game is currently in progress. <Button as="a" href={`/games/${GAME_ID}`} variant="info" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginLeft: "0.5rem" }}>Join game</Button>
          </Alert>
        )}
      </div>
    </Layout>
  );
}
