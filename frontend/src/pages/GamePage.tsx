import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getGameState, buyStock, sellStock, finishGame } from "../api/gameApi";
import type { GameState } from "../types/game";
import { getUser } from "../utils/auth";

import PlayerTable from "../components/PlayerTable";
import HoldingsTable from "../components/HoldingsTable";
import Navbar from "../components/Navbar";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const GAME_ID = Number(gameId);

  const [game, setGame] = useState<GameState | null>(null);

  const [buySymbol, setBuySymbol] = useState("");
  const [buyQuantity, setBuyQuantity] = useState(1);

  const [sellSymbol, setSellSymbol] = useState("");
  const [sellQuantity, setSellQuantity] = useState(1);

  async function loadGame() {
    try {
      const response = await getGameState(GAME_ID);

      setGame(response);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadGame();
  }, []);

  async function handleBuy() {
    try {
      await buyStock(GAME_ID, buySymbol.toUpperCase(), buyQuantity);

      setBuySymbol("");
      setBuyQuantity(1);

      await loadGame();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSell() {
    try {
      await sellStock(GAME_ID, sellSymbol.toUpperCase(), sellQuantity);

      setSellSymbol("");
      setSellQuantity(1);

      await loadGame();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleFinishGame() {
    try {
      await finishGame(GAME_ID);
      navigate(`/games/${GAME_ID}/results`);
    } catch (error) {
      console.error(error);
    }
  }

  if (game == null) {
    return <h2>Loading...</h2>;
  }

  const currentUser = getUser();
  const currentPlayer = game.players.find(
    (player) => player.username === currentUser?.username,
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Stock Game</h1>
        <h2>Status: {game.status}</h2>
        <PlayerTable players={game.players} />
        <h2>Your Holdings</h2>
        {currentPlayer && <HoldingsTable holdings={currentPlayer.holdings} />}
        <hr />
        <h2>Buy Stock</h2>
        <input
          type="text"
          placeholder="Ticker"
          value={buySymbol}
          onChange={(e) => setBuySymbol(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />

        <input
          type="number"
          min={1}
          value={buyQuantity}
          onChange={(e) => setBuyQuantity(Number(e.target.value))}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />

        <button
          onClick={handleBuy}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Buy
        </button>

        <hr />

        <h2>Sell Stock</h2>
        <input
          type="text"
          placeholder="Ticker"
          value={sellSymbol}
          onChange={(e) => setSellSymbol(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <input
          type="number"
          min={1}
          value={sellQuantity}
          onChange={(e) => setSellQuantity(Number(e.target.value))}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button
          onClick={handleSell}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sell
        </button>

        <hr />

        <button
          onClick={handleFinishGame}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Finish Game
        </button>
      </div>
    </div>
  );
}
