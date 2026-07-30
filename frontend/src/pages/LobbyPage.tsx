import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Game } from "../types/game";

import { getGame, startGame } from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import { getUser } from "../utils/auth";
import { money } from "../utils/format";

import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function LobbyPage() {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { gameId } = useParams();
  const navigate = useNavigate();

  const GAME_ID = Number(gameId);
  const currentUser = getUser();

  const loadGame = useCallback(async () => {
    try {
      setGame(await getGame(GAME_ID));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this lobby."));
    }
  }, [GAME_ID]);

  useEffect(() => {
    // Polling the server is exactly the "subscribe to an external system" case
    // effects are for; loadGame is async, so nothing is set synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGame();
    const interval = setInterval(loadGame, 3000);
    return () => clearInterval(interval);
  }, [loadGame]);

  // Once the host starts the game, move everyone who is still sitting in the
  // lobby into it rather than leaving them polling a stale screen.
  useEffect(() => {
    if (game?.status === "IN_PROGRESS") {
      navigate(`/games/${GAME_ID}`);
    }
  }, [game?.status, GAME_ID, navigate]);

  async function handleStartGame() {
    setError(null);
    try {
      await startGame(GAME_ID);
      navigate(`/games/${GAME_ID}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not start the game."));
    }
  }

  async function copyInviteCode() {
    if (!game) return;
    try {
      await navigator.clipboard.writeText(game.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the code is on screen to type anyway.
    }
  }

  if (game == null) {
    return (
      <>
        <Navbar />
        <div className="page">
          {error ? <div className="alert alert--error">{error}</div> : <p className="empty">Loading...</p>}
        </div>
      </>
    );
  }

  const isHost = game.createdByUsername === currentUser?.username;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page__head">
          <div className="page__title-group">
            <h1>{game.name}</h1>
            <div className="row">
              <StatusBadge status={game.status} />
              <span className="muted small">
                Hosted by {game.createdByUsername} · {money(game.initialCash)} to start
              </span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="grid-2">
          <div className="card">
            <div className="card__head">
              <span className="card__title">Invite code</span>
            </div>
            <div className="card__body">
              <div className="stack stack--tight">
                <div className="row">
                  <span className="invite-code">{game.inviteCode}</span>
                  <button className="btn btn--sm" onClick={copyInviteCode}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="dim small">
                  Share this with your friends so they can join.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__head">
              <span className="card__title">Players ({game.players.length})</span>
            </div>
            <div className="card__body card__body--flush">
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th className="num">Cash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.players.map((player) => (
                      <tr
                        key={player.username}
                        className={
                          player.username === currentUser?.username ? "is-you" : undefined
                        }
                      >
                        <td>
                          {player.username}{" "}
                          {player.username === game.createdByUsername && (
                            <span className="badge badge--host">Host</span>
                          )}
                        </td>
                        <td className="num">{money(player.cashBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          {/* The server only lets the host start the game, so don't show a
              button that would just return 403 for everybody else. */}
          {isHost ? (
            <button
              className="btn btn--primary"
              onClick={handleStartGame}
              disabled={game.status !== "WAITING"}
            >
              Start game
            </button>
          ) : (
            <p className="muted small">
              Waiting for {game.createdByUsername} to start the game...
            </p>
          )}
        </div>
      </div>
    </>
  );
}
