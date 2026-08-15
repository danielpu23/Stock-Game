import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createGame } from "../api/gameApi";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [initialCash, setInitialCash] = useState(10000);

  async function handleCreateGame() {
    if (name.trim() === "") {
      alert("Please enter a game name.");
      return;
    }

    if (initialCash <= 0) {
      alert("Starting cash must be greater than zero.");
      return;
    }

    try {
      const game = await createGame(name, initialCash);

      navigate(`/games/${game.id}/lobby`);
    } catch (error) {
      console.error(error);

      alert("Unable to create game.");
    }
  }

  return (
    <Layout>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <Card title="Create Game">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#333" }}>
                Game Name
              </label>
              <Input
                type="text"
                data-testid="game-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter game name"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#333" }}>
                Starting Cash
              </label>
              <Input
                type="number"
                data-testid="initial-cash-input"
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value))}
                min={1}
              />
            </div>

            <Button onClick={handleCreateGame} variant="primary" data-testid="create-game-submit-btn">
              Create Game
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
