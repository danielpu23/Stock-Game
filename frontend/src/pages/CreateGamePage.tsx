import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createGame } from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import Navbar from "../components/Navbar";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [initialCash, setInitialCash] = useState(10000);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim() === "") {
      setError("Please enter a game name.");
      return;
    }

    if (!Number.isFinite(initialCash) || initialCash <= 0) {
      setError("Starting cash must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const game = await createGame(name.trim(), initialCash);
      navigate(`/games/${game.id}/lobby`);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create game."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page page--narrow">
        <div className="page__head">
          <div className="page__title-group">
            <h1>New game</h1>
            <p className="muted small">
              Everyone starts with the same cash. You'll get an invite code to share.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <form onSubmit={handleCreateGame} className="stack stack--tight">
              {error && <div className="alert alert--error">{error}</div>}

              <div className="field">
                <label className="label" htmlFor="gameName">
                  Game name
                </label>
                <input
                  className="input"
                  id="gameName"
                  type="text"
                  placeholder="Friday Night Trading"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="startingCash">
                  Starting cash
                </label>
                <input
                  className="input input--num"
                  id="startingCash"
                  type="number"
                  min={1}
                  step={100}
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                />
              </div>

              <div className="row">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create game"}
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
