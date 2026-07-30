import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getGameState, buyStock, sellStock, finishGame, getLeaderboard, getTransactions } from "../api/gameApi";
import { getStockPrice } from "../api/stockApi";
import type { GameState } from "../types/game";
import type { GameResult } from "../types/result";
import { getUser } from "../utils/auth";

import PlayerTable from "../components/PlayerTable";
import HoldingsTable from "../components/HoldingsTable";
import Leaderboard from "../components/Leaderboard";
import StockChart from "../components/StockChart";
import Navbar from "../components/Navbar";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const GAME_ID = Number(gameId);

  const [game, setGame] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameResult[] | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);

  const [buySymbol, setBuySymbol] = useState("");
  const [buyQuantity, setBuyQuantity] = useState(1);

  const [sellSymbol, setSellSymbol] = useState("");
  const [sellQuantity, setSellQuantity] = useState(1);
  const [showTransactions, setShowTransactions] = useState(false);
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadGame() {
    try {
      const [gameResponse, leaderboardResponse] = await Promise.all([
        getGameState(GAME_ID),
        getLeaderboard(GAME_ID),
      ]);

      setGame(gameResponse);
      setLeaderboard(leaderboardResponse);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadGame();
    const interval = setInterval(loadGame, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  async function handleBuy() {
    setError(null);
    setSuccess(null);
    
    if (!buySymbol.trim()) {
      setError("Please enter a stock symbol");
      return;
    }
    
    if (buyQuantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      await buyStock(GAME_ID, buySymbol.toUpperCase(), buyQuantity);
      setSuccess("Stock purchased successfully!");
      setBuySymbol("");
      setBuyQuantity(1);
      setStockPrice(null);
      await loadGame();
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to purchase stock. Please try again.");
    }
  }

  async function handleSell() {
    setError(null);
    setSuccess(null);
    
    if (!sellSymbol.trim()) {
      setError("Please enter a stock symbol");
      return;
    }
    
    if (sellQuantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      await sellStock(GAME_ID, sellSymbol.toUpperCase(), sellQuantity);
      setSuccess("Stock sold successfully!");
      setSellSymbol("");
      setSellQuantity(1);
      setStockPrice(null);
      await loadGame();
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to sell stock. Please try again.");
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

  async function loadTransactions() {
    if (!currentPlayer) return;
    
    try {
      // Find the player session ID from the game state
      // This is a workaround - ideally the backend would provide playerSessionId in the game state
      const currentUser = getUser();
      const playerSessionId = game?.players.findIndex(
        (p) => p.username === currentUser?.username
      );
      
      if (playerSessionId !== undefined && playerSessionId >= 0) {
        const txs = await getTransactions(playerSessionId + 1); // +1 because IDs are 1-based
        setTransactions(txs);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleTransactions() {
    if (!showTransactions) {
      await loadTransactions();
    }
    setShowTransactions(!showTransactions);
  }

  async function fetchStockPrice(symbol: string) {
    if (!symbol) {
      setStockPrice(null);
      return;
    }
    try {
      const price = await getStockPrice(symbol);
      setStockPrice(price);
    } catch (error) {
      console.error(error);
      setStockPrice(null);
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
        
        {game.status === "FINISHED" && (
          <div style={{ 
            backgroundColor: "#fff3cd", 
            color: "#856404", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            border: "1px solid #ffc107"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>🎮 Game Over!</h3>
            <p style={{ margin: 0 }}>
              This game has finished. View the final results on the results page or return to the menu to start a new game.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={() => navigate(`/games/${GAME_ID}/results`)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "0.5rem"
                }}
              >
                View Results
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem" 
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            backgroundColor: "#d4edda", 
            color: "#155724", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem" 
          }}>
            {success}
          </div>
        )}
        
        <PlayerTable players={game.players} />
        <h2>Your Holdings</h2>
        {currentPlayer && <HoldingsTable holdings={currentPlayer.holdings} />}
        {leaderboard && <Leaderboard leaderboard={leaderboard} />}
        
        {game.status !== "FINISHED" && (
          <>
            <hr />
            <h2>Buy Stock</h2>
            <input
              type="text"
              placeholder="Ticker"
              value={buySymbol}
              onChange={(e) => {
                setBuySymbol(e.target.value);
                fetchStockPrice(e.target.value);
              }}
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />

            <input
              type="number"
              min={1}
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(Number(e.target.value))}
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />

            {stockPrice !== null && (
              <>
                <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
                  ${stockPrice.toFixed(2)}
                </span>
                <StockChart 
                  symbol={buySymbol.toUpperCase()} 
                  currentPrice={stockPrice}
                />
              </>
            )}

            <button
              onClick={handleBuy}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1rem",
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
              onChange={(e) => {
                setSellSymbol(e.target.value);
                fetchStockPrice(e.target.value);
              }}
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />
            <input
              type="number"
              min={1}
              value={sellQuantity}
              onChange={(e) => setSellQuantity(Number(e.target.value))}
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />

            {stockPrice !== null && (
              <>
                <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
                  ${stockPrice.toFixed(2)}
                </span>
                <StockChart 
                  symbol={sellSymbol.toUpperCase()} 
                  currentPrice={stockPrice}
                />
              </>
            )}

            <button
              onClick={handleSell}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1rem",
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

            <hr />

            <button
              onClick={toggleTransactions}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showTransactions ? "Hide Transactions" : "Show Transactions"}
            </button>

            {showTransactions && transactions && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Transaction History</h3>
                {transactions.length === 0 ? (
                  <p>No transactions yet.</p>
                ) : (
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Type</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Symbol</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Quantity</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Price</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: "1px solid #ddd" }}>
                          <td style={{ padding: "8px" }}>{tx.type}</td>
                          <td style={{ padding: "8px" }}>{tx.symbol}</td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {tx.quantity}
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            ${tx.price.toFixed(2)}
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
