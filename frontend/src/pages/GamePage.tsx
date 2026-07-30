import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getGame,
  getGameState,
  buyStock,
  sellStock,
  finishGame,
  getLeaderboard,
  getTransactions,
} from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import type { Game, GameState } from "../types/game";
import type { GameResult } from "../types/result";
import type { Transaction } from "../types/transaction";
import { getUser } from "../utils/auth";
import { directionClass, money, signedMoney } from "../utils/format";
import { useStockQuote } from "../hooks/useStockQuote";

import PlayerTable from "../components/PlayerTable";
import HoldingsTable from "../components/HoldingsTable";
import Leaderboard from "../components/Leaderboard";
import StockChart from "../components/StockChart";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const GAME_ID = Number(gameId);

  const [game, setGame] = useState<GameState | null>(null);
  const [details, setDetails] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameResult[] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  // One ticker box drives both buy and sell now, rather than two separate
  // sections each with their own symbol, quantity, and quote.
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [showTransactions, setShowTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const quote = useStockQuote(symbol);
  const currentUser = getUser();

  const loadGame = useCallback(async () => {
    try {
      const [gameResponse, leaderboardResponse] = await Promise.all([
        getGameState(GAME_ID),
        getLeaderboard(GAME_ID),
      ]);

      setGame(gameResponse);
      setLeaderboard(leaderboardResponse);
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load this game."));
    }
  }, [GAME_ID]);

  useEffect(() => {
    // Fetched once: the name and creator don't change while the game runs.
    getGame(GAME_ID)
      .then(setDetails)
      .catch(() => setDetails(null));
  }, [GAME_ID]);

  useEffect(() => {
    loadGame();
    const interval = setInterval(loadGame, 5000);
    return () => clearInterval(interval);
  }, [loadGame]);

  // A game that hasn't started yet belongs in the lobby — otherwise this page
  // offers a trade panel whose every order the server rejects.
  useEffect(() => {
    if (game?.status === "WAITING") {
      navigate(`/games/${GAME_ID}/lobby`, { replace: true });
    }
  }, [game?.status, GAME_ID, navigate]);

  const loadTransactions = useCallback(async () => {
    try {
      // The server works out which player session is ours. This used to guess a
      // playerSessionId from the player's index in the list, which meant the
      // history shown was somebody else's as soon as ids didn't line up.
      setTransactions(await getTransactions(GAME_ID));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your transactions."));
    }
  }, [GAME_ID]);

  async function trade(action: "buy" | "sell") {
    setError(null);
    setSuccess(null);

    const ticker = symbol.trim().toUpperCase();

    if (!ticker) {
      setError("Enter a ticker symbol.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a whole number of at least 1.");
      return;
    }

    setPending(true);
    try {
      if (action === "buy") {
        await buyStock(GAME_ID, ticker, quantity);
        setSuccess(`Bought ${quantity} ${ticker}`);
      } else {
        await sellStock(GAME_ID, ticker, quantity);
        setSuccess(`Sold ${quantity} ${ticker}`);
      }

      setSymbol("");
      setQuantity(1);

      await loadGame();
      if (showTransactions) {
        await loadTransactions();
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          action === "buy" ? "Failed to buy." : "Failed to sell.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  async function handleFinishGame() {
    setError(null);
    try {
      await finishGame(GAME_ID);
      navigate(`/games/${GAME_ID}/results`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not finish the game."));
    }
  }

  async function toggleTransactions() {
    if (!showTransactions) {
      await loadTransactions();
    }
    setShowTransactions(!showTransactions);
  }

  if (game == null) {
    return (
      <>
        <Navbar />
        <div className="page">
          {loadError ? (
            <div className="alert alert--error">{loadError}</div>
          ) : (
            <p className="empty">Loading...</p>
          )}
        </div>
      </>
    );
  }

  const isHost =
    details != null && details.createdByUsername === currentUser?.username;

  const me = game.players.find(
    (player) => player.username === currentUser?.username,
  );

  const myRank = leaderboard?.find(
    (row) => row.username === currentUser?.username,
  );

  const netWorth = me ? me.cashBalance + me.portfolioValue : 0;
  const isOver = game.status === "FINISHED";

  const estimate = quote.price !== null ? quote.price * quantity : null;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page__head">
          <div className="page__title-group">
            <h1>{details?.name ?? "Stock Game"}</h1>
            <div className="row">
              <StatusBadge status={game.status} />
              <span className="muted small">
                {game.players.length} player{game.players.length === 1 ? "" : "s"}
                {details && ` · ${money(details.initialCash)} to start`}
              </span>
            </div>
          </div>

          <div className="row">
            <button className="btn btn--ghost" onClick={toggleTransactions}>
              {showTransactions ? "Hide history" : "Trade history"}
            </button>
            {isHost && !isOver && (
              <button className="btn btn--ghost" onClick={handleFinishGame}>
                End game
              </button>
            )}
            {isOver && (
              <button
                className="btn btn--primary"
                onClick={() => navigate(`/games/${GAME_ID}/results`)}
              >
                View results
              </button>
            )}
          </div>
        </div>

        <div className="stack">
          {isOver && (
            <div className="alert alert--warn">
              This game has finished. Trading is closed.
            </div>
          )}
          {loadError && <div className="alert alert--error">{loadError}</div>}
          {error && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">{success}</div>}

          {me && (
            <div className="stats">
              <div className="stat">
                <div className="stat__label">Net worth</div>
                <div className="stat__value">{money(netWorth)}</div>
                {myRank && (
                  <div className={`stat__sub ${directionClass(myRank.profitLoss)}`}>
                    {signedMoney(myRank.profitLoss)}
                  </div>
                )}
              </div>

              <div className="stat">
                <div className="stat__label">Buying power</div>
                <div className="stat__value">{money(me.cashBalance)}</div>
                <div className="stat__sub">cash available</div>
              </div>

              <div className="stat">
                <div className="stat__label">Holdings</div>
                <div className="stat__value">{money(me.portfolioValue)}</div>
                <div className="stat__sub">
                  {me.holdings.length} position{me.holdings.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="stat">
                <div className="stat__label">Rank</div>
                <div className="stat__value">
                  {myRank ? `#${myRank.rank}` : "—"}
                </div>
                <div className="stat__sub">of {game.players.length}</div>
              </div>
            </div>
          )}

          <div className={isOver ? "grid-2" : "grid-trade"}>
            {!isOver && (
              <div className="card">
                <div className="card__head">
                  <span className="card__title">Trade</span>
                </div>
                <div className="card__body">
                  <div className="stack stack--tight">
                    <div className="trade__inputs">
                      <div className="field">
                        <label className="label" htmlFor="symbol">
                          Ticker
                        </label>
                        <input
                          className="input input--ticker"
                          id="symbol"
                          type="text"
                          placeholder="AAPL"
                          maxLength={5}
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label className="label" htmlFor="quantity">
                          Shares
                        </label>
                        <input
                          className="input input--num"
                          id="quantity"
                          type="number"
                          min={1}
                          step={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {quote.loading && <p className="trade__hint">Fetching quote...</p>}
                    {quote.error && <p className="trade__hint down">{quote.error}</p>}

                    {quote.price !== null && (
                      <>
                        <StockChart
                          symbol={quote.symbol}
                          price={quote.price}
                          history={quote.history}
                        />
                        {estimate !== null && (
                          <p className="trade__hint">
                            {quantity} × {money(quote.price)} ={" "}
                            <strong>{money(estimate)}</strong>
                            {me && estimate > me.cashBalance && (
                              <span className="down"> · more than your cash</span>
                            )}
                          </p>
                        )}
                      </>
                    )}

                    <div className="trade__actions">
                      <button
                        className="btn btn--buy"
                        onClick={() => trade("buy")}
                        disabled={pending}
                      >
                        Buy
                      </button>
                      <button
                        className="btn btn--sell"
                        onClick={() => trade("sell")}
                        disabled={pending}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card__head">
                <span className="card__title">Your positions</span>
                {me && <span className="muted small">{money(me.portfolioValue)}</span>}
              </div>
              <div className="card__body card__body--flush">
                {me && <HoldingsTable holdings={me.holdings} />}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card__head">
                <span className="card__title">Leaderboard</span>
              </div>
              <div className="card__body card__body--flush">
                {leaderboard && (
                  <Leaderboard
                    leaderboard={leaderboard}
                    currentUsername={currentUser?.username}
                    showBreakdown={false}
                  />
                )}
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <span className="card__title">All players</span>
              </div>
              <div className="card__body card__body--flush">
                <PlayerTable
                  players={game.players}
                  currentUsername={currentUser?.username}
                />
              </div>
            </div>
          </div>

          {showTransactions && (
            <div className="card">
              <div className="card__head">
                <span className="card__title">Your trade history</span>
              </div>
              <div className="card__body card__body--flush">
                {transactions == null ? (
                  <p className="empty">Loading...</p>
                ) : transactions.length === 0 ? (
                  <p className="empty">You haven't traded yet.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Symbol</th>
                          <th className="num">Shares</th>
                          <th className="num">Price</th>
                          <th className="num">Total</th>
                          <th className="num">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...transactions]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime(),
                          )
                          .map((tx) => (
                            <tr key={tx.id}>
                              <td className={tx.type === "BUY" ? "up" : "down"}>
                                {tx.type}
                              </td>
                              <td className="ticker">{tx.symbol}</td>
                              <td className="num">{tx.quantity}</td>
                              <td className="num">{money(tx.price)}</td>
                              <td className="num">{money(tx.price * tx.quantity)}</td>
                              <td className="num dim">
                                {new Date(tx.createdAt).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
