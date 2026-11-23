import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getGameState,
  buyStock,
  sellStock,
  finishGame,
  getLeaderboard,
  getTransactions,
} from "../api/gameApi";
import { getStockPrice } from "../api/stockApi";
import type { GameState } from "../types/game";
import type { GameResult } from "../types/result";
import { getUser } from "../utils/auth";
import { isMarketHours, getMarketStatusMessage } from "../utils/marketHours";

import PlayerTable from "../components/PlayerTable";
import HoldingsTable from "../components/HoldingsTable";
import Leaderboard from "../components/Leaderboard";
import StockChart from "../components/StockChart";
import PortfolioPieChart from "../components/PortfolioPieChart";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Grid from "../components/ui/Grid";
import Layout from "../components/ui/Layout";

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
  const [marketOpen, setMarketOpen] = useState(isMarketHours());

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

    // Check market hours every minute
    const marketInterval = setInterval(() => {
      setMarketOpen(isMarketHours());
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(marketInterval);
    };
  }, []);

  async function handleBuy() {
    setError(null);
    setSuccess(null);

    if (!marketOpen) {
      setError(
        "Trading is only available during market hours (4:00 AM - 8:00 PM ET, Monday - Friday)",
      );
      return;
    }

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
      setError(
        error.response?.data?.message ||
          "Failed to purchase stock. Please try again.",
      );
    }
  }

  async function handleSell() {
    setError(null);
    setSuccess(null);

    if (!marketOpen) {
      setError(
        "Trading is only available during market hours (4:00 AM - 8:00 PM ET, Monday - Friday)",
      );
      return;
    }

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
      setError(
        error.response?.data?.message ||
          "Failed to sell stock. Please try again.",
      );
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
      const txs = await getTransactions(currentPlayer.playerSessionId);
      setTransactions(txs);
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
    <Layout>
      <Navbar />
      <div className="game-container">
        <div className="mb-8">
          <h1 className="text-primary mb-2">Stock Game</h1>
          <p className="text-secondary" style={{ margin: 0 }}>
            Status: <strong>{game.status}</strong>
          </p>
        </div>

        {game.status === "FINISHED" && (
          <Alert type="warning" style={{ marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>🎮 Game Over!</h3>
            <p style={{ margin: 0 }}>
              This game has finished. View the final results on the results page
              or return to the menu to start a new game.
            </p>
            <div className="form-row mt-4">
              <Button
                onClick={() => navigate(`/games/${GAME_ID}/results`)}
                variant="info"
              >
                View Results
              </Button>
              <Button onClick={() => navigate("/")} variant="secondary">
                Back to Menu
              </Button>
            </div>
          </Alert>
        )}

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <Alert type={marketOpen ? "success" : "warning"}>
          {getMarketStatusMessage()}
        </Alert>

        <Grid columns={2} gap="1.5rem" style={{ marginBottom: "1.5rem" }}>
          <Card title="Players">
            <PlayerTable players={game.players} />
          </Card>

          <Card title="Your Holdings">
            {currentPlayer ? (
              <HoldingsTable holdings={currentPlayer.holdings} />
            ) : (
              <p className="text-secondary">Loading holdings...</p>
            )}
          </Card>
        </Grid>

        {currentPlayer && (
          <Card
            title="Portfolio Distribution"
            style={{ marginBottom: "1.5rem" }}
          >
            <PortfolioPieChart
              cashBalance={currentPlayer.cashBalance}
              holdings={currentPlayer.holdings.map((h) => ({
                symbol: h.symbol,
                quantity: h.quantity,
              }))}
            />
          </Card>
        )}

        {leaderboard && (
          <Card title="Leaderboard" style={{ marginBottom: "1.5rem" }}>
            <Leaderboard leaderboard={leaderboard} />
          </Card>
        )}

        {game.status !== "FINISHED" && (
          <Grid columns={2} gap="1.5rem">
            <Card title="Buy Stock">
              <div className="form-container">
                <div className="form-row">
                  <Input
                    type="text"
                    placeholder="Ticker"
                    value={buySymbol}
                    onChange={(e) => {
                      const uppercased = e.target.value.toUpperCase();
                      setBuySymbol(uppercased);
                      fetchStockPrice(uppercased);
                    }}
                    className="input-flex"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Number(e.target.value))}
                    className="input-narrow"
                  />
                </div>

                {stockPrice !== null && (
                  <>
                    <div className="stock-price-display">
                      Current Price: ${stockPrice.toFixed(2)}
                    </div>
                    <StockChart
                      symbol={buySymbol.toUpperCase()}
                      currentPrice={stockPrice}
                    />
                  </>
                )}

                <Button
                  onClick={handleBuy}
                  variant="success"
                  disabled={!marketOpen}
                >
                  {marketOpen ? "Buy Stock" : "Market Closed"}
                </Button>
              </div>
            </Card>

            <Card title="Sell Stock">
              <div className="form-container">
                <div className="form-row">
                  <Input
                    type="text"
                    placeholder="Ticker"
                    value={sellSymbol}
                    onChange={(e) => {
                      const uppercased = e.target.value.toUpperCase();
                      setSellSymbol(uppercased);
                      fetchStockPrice(uppercased);
                    }}
                    className="input-flex"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Number(e.target.value))}
                    className="input-narrow"
                  />
                </div>

                {stockPrice !== null && (
                  <>
                    <div className="stock-price-display">
                      Current Price: ${stockPrice.toFixed(2)}
                    </div>
                    <StockChart
                      symbol={sellSymbol.toUpperCase()}
                      currentPrice={stockPrice}
                    />
                  </>
                )}

                <Button
                  onClick={handleSell}
                  variant="danger"
                  disabled={!marketOpen}
                >
                  {marketOpen ? "Sell Stock" : "Market Closed"}
                </Button>
              </div>
            </Card>
          </Grid>
        )}

        {game.status !== "FINISHED" && (
          <div className="form-row mt-6">
            <Button onClick={handleFinishGame} variant="secondary">
              Finish Game
            </Button>
            <Button onClick={toggleTransactions} variant="info">
              {showTransactions ? "Hide Transactions" : "Show Transactions"}
            </Button>
          </div>
        )}

        {showTransactions && transactions && (
          <Card title="Transaction History" style={{ marginTop: "1.5rem" }}>
            {transactions.length === 0 ? (
              <p className="text-secondary">No transactions yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.type}</td>
                      <td>{tx.symbol}</td>
                      <td className="text-right">{tx.quantity}</td>
                      <td className="text-right">${tx.price.toFixed(2)}</td>
                      <td className="text-right">
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
}
