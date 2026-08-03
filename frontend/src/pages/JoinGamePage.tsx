import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinGame } from "../api/gameApi";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";

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
    <Layout>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <Card title="Join Game">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#333" }}>
                Invite Code
              </label>
              <Input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
              />
            </div>

            <Button onClick={handleJoinGame} variant="success">
              Join Game
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
