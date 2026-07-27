import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinGame } from "../api/gameApi";
import Navbar from "../components/Navbar";

export default function JoinGamePage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");

  async function handleJoinGame() {
    if (inviteCode.trim() === "") {
      alert("Please enter an invite code.");
      return;
    }

    try {
      await joinGame(inviteCode);
      alert("Successfully joined the game!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Unable to join game. Please check the invite code.");
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Join Game</h1>

        <div>
          <label>Invite Code</label>
          <br />
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            style={{ padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <br />

        <button
          onClick={handleJoinGame}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
