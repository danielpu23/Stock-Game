import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getResults } from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import { getUser } from "../utils/auth";
import { directionClass, signedMoney } from "../utils/format";
import type { GameResult } from "../types/result";

import Navbar from "../components/Navbar";
import Leaderboard from "../components/Leaderboard";

export default function ResultsPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState<GameResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getUser();

  useEffect(() => {
    getResults(Number(gameId))
      .then(setResults)
      .catch((err) => {
        setResults([]);
        setError(getErrorMessage(err, "Could not load the results."));
      });
  }, [gameId]);

  const winner = results?.[0];

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page__head">
          <div className="page__title-group">
            <h1>Final results</h1>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate("/")}>
            Back to games
          </button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {results === null ? (
          <p className="empty">Loading...</p>
        ) : results.length === 0 ? (
          !error && <p className="empty">No results to show.</p>
        ) : (
          <div className="stack">
            {winner && (
              <div className="winner">
                <span className="winner__medal">🏆</span>
                <div>
                  <div className="winner__label">Winner</div>
                  <div className="winner__name">{winner.username}</div>
                  <div className={`small ${directionClass(winner.profitLoss)}`}>
                    {signedMoney(winner.profitLoss)} on the game
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card__head">
                <span className="card__title">Final standings</span>
              </div>
              <div className="card__body card__body--flush">
                <Leaderboard
                  leaderboard={results}
                  currentUsername={currentUser?.username}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
