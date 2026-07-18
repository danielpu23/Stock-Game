import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getGameState, buyStock, sellStock } from "../api/gameApi";
import type { GameState } from "../types/game";

import PlayerTable from "../components/PlayerTable";
import HoldingsTable from "../components/HoldingsTable";

export default function GamePage() {
  const { gameId } = useParams();

  const GAME_ID = Number(gameId);
  const USER_ID = 1;

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
      await buyStock(GAME_ID, USER_ID, buySymbol.toUpperCase(), buyQuantity);

      setBuySymbol("");
      setBuyQuantity(1);

      await loadGame();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSell() {
    try {
      await sellStock(GAME_ID, USER_ID, sellSymbol.toUpperCase(), sellQuantity);

      setSellSymbol("");
      setSellQuantity(1);

      await loadGame();
    } catch (error) {
      console.error(error);
    }
  }

  if (game == null) {
    return <h2>Loading...</h2>;
  }

  const currentPlayer = game.players.find(
    (player) => player.username === "daniel",
  );

  return (
    <div>
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
      />

      <input
        type="number"
        min={1}
        value={buyQuantity}
        onChange={(e) => setBuyQuantity(Number(e.target.value))}
      />

      <button onClick={handleBuy}>Buy</button>

      <hr />

      <h2>Sell Stock</h2>
      <input
        type="text"
        placeholder="Ticker"
        value={sellSymbol}
        onChange={(e) => setSellSymbol(e.target.value)}
      />
      <input
        type="number"
        min={1}
        value={sellQuantity}
        onChange={(e) => setSellQuantity(Number(e.target.value))}
      />
      <button onClick={handleSell}>Sell</button>
    </div>
  );
}
