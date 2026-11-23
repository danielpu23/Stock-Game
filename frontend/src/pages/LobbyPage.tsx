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
        <div className="loading">
          <h2>Loading...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="container" style={{ maxWidth: "1200px" }}>
        <div className="mb-8">
          <h1 className="text-primary mb-2">{game.name}</h1>
          <p className="text-secondary" style={{ margin: 0 }}>Lobby</p>
        </div>

        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Card title="Invite Code">
            <div className="text-2xl font-bold" style={{ color: "#007bff", letterSpacing: "2px" }}>
              {game.inviteCode}
            </div>
          </Card>

          <Card title="Game Status">
            <div className="text-xl font-semibold text-primary">
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
