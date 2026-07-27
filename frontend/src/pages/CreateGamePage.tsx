import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createGame } from "../api/gameApi";
import Navbar from "../components/Navbar";

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
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Create Game</h1>

        <div>
          <label>Game Name</label>

          <br />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <br />

        <div>
          <label>Starting Cash</label>

          <br />

          <input
            type="number"
            value={initialCash}
            onChange={(e) => setInitialCash(Number(e.target.value))}
            style={{ padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <br />

        <button
          onClick={handleCreateGame}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Game
        </button>
      </div>
    </div>
  );
}
