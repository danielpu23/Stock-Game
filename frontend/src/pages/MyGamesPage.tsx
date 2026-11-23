import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "../api/gameApi";
import type { Game } from "../types/game";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";
import Alert from "../components/ui/Alert";

export default function MyGamesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        const userGames = await getMyGames();
        setGames(userGames);
      } catch (err) {
        setError("Failed to load your games");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  const handleGameClick = (game: Game) => {
    if (game.status === "FINISHED") {
      navigate(`/games/${game.id}/results`);
    } else if (game.status === "IN_PROGRESS") {
      navigate(`/games/${game.id}`);
    } else {
      navigate(`/games/${game.id}/lobby`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "#ffc107";
      case "IN_PROGRESS":
        return "#28a745";
      case "FINISHED":
        return "#6c757d";
      default:
        return "#007bff";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "In Lobby";
      case "IN_PROGRESS":
        return "In Progress";
      case "FINISHED":
        return "Completed";
      default:
        return status;
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Go to Lobby";
      case "IN_PROGRESS":
        return "Continue Game";
      case "FINISHED":
        return "View Results";
      default:
        return "View Game";
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="loading">
          <h2>Loading your games...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="container">
        <h1 className="text-primary mb-8">My Games</h1>

        {error && <Alert type="error">{error}</Alert>}

        {games.length === 0 ? (
          <Card data-testid="empty-state">
            <p className="empty-state">
              You haven't created any games yet. Start by creating a new game!
            </p>
            <div className="text-center mt-4">
              <Button
                onClick={() => navigate("/create")}
                variant="primary"
                data-testid="create-first-game-btn"
              >
                Create Your First Game
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="clickable"
              >
                <Card
                  data-testid={`game-card-${game.id}`}
                  style={{
                    borderLeft: `4px solid ${getStatusColor(game.status)}`,
                  }}
                >
                  <div className="flex-between">
                    <div>
                      <h3 className="mb-2 text-primary">
                        {game.name}
                      </h3>
                      <div className="flex gap-4 text-sm text-secondary">
                        <span>
                          Code: <strong>{game.inviteCode}</strong>
                        </span>
                        <span>
                          Status:{" "}
                          <strong
                            style={{ color: getStatusColor(game.status) }}
                          >
                            {getStatusText(game.status)}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleGameClick(game)}
                    >
                      {getActionText(game.status)}
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
