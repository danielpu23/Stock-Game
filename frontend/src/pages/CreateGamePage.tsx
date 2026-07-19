import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createGame } from "../api/gameApi";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [initialCash, setInitialCash] = useState(10000);
  const [userId, setUserId] = useState(1);

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
      const game = await createGame(userId, name, initialCash);

      navigate(`/games/${game.id}/lobby`);
    } catch (error) {
      console.error(error);

      alert("Unable to create game.");
    }
  }

  return (
    <div>
      <h1>Create Game</h1>

      <div>
        <label>Game Name</label>

        <br />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        />
      </div>

      <br />

      <div>
        <label>User ID</label>

        <br />

        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
        />
      </div>

      <br />

      <button onClick={handleCreateGame}>Create Game</button>
    </div>
  );
}
