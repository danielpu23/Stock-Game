import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { getMyGames } from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import { money } from "../utils/format";
import type { GameSummary } from "../types/game";

export default function HomePage() {
  const navigate = useNavigate();

  const [games, setGames] = useState<GameSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyGames()
      .then(setGames)
      .catch((err) => {
        setGames([]);
        setError(getErrorMessage(err, "Could not load your games."));
      });
  }, []);

  /** Where a given game should take you, based on how far along it is. */
  function destinationFor(game: GameSummary): string {
    if (game.status === "WAITING") return `/games/${game.id}/lobby`;
    if (game.status === "FINISHED") return `/games/${game.id}/results`;
    return `/games/${game.id}`;
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page__head">
          <div className="page__title-group">
            <h1>Your games</h1>
            <p className="muted small">
              Create a game and share the invite code, or join one with a code.
            </p>
          </div>

          <div className="row">
            <button className="btn btn--ghost" onClick={() => navigate("/join")}>
              Join with code
            </button>
            <button className="btn btn--primary" onClick={() => navigate("/create")}>
              New game
            </button>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {/*
          Without this list a player who joined by invite code had no route back
          to the game — the home page only offered "create" and "join".
        */}
        <div className="card">
          {games === null ? (
            <p className="empty">Loading...</p>
          ) : games.length === 0 ? (
            <p className="empty">
              You haven't joined any games yet. Create one to get started.
            </p>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Status</th>
                    <th>Invite code</th>
                    <th className="num">Players</th>
                    <th className="num">Your cash</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td>
                        {game.name}{" "}
                        {game.createdByMe && <span className="badge badge--host">Host</span>}
                      </td>
                      <td>
                        <StatusBadge status={game.status} />
                      </td>
                      <td className="ticker">{game.inviteCode}</td>
                      <td className="num">{game.playerCount}</td>
                      <td className="num">{money(game.cashBalance)}</td>
                      <td className="num">
                        <button
                          className="btn btn--sm"
                          onClick={() => navigate(destinationFor(game))}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
