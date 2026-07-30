import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { joinGame } from "../api/gameApi";
import { getErrorMessage } from "../api/errors";
import Navbar from "../components/Navbar";

export default function JoinGamePage() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleJoinGame(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (inviteCode.trim() === "") {
      setError("Please enter an invite code.");
      return;
    }

    setSubmitting(true);
    try {
      const game = await joinGame(inviteCode.trim());

      // Go straight to the game. This used to navigate to "/", which stranded
      // the player with no way to reach the game they had just joined.
      navigate(
        game.status === "WAITING"
          ? `/games/${game.id}/lobby`
          : `/games/${game.id}`,
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to join that game."));
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
            <h1>Join a game</h1>
            <p className="muted small">
              Enter the six-character code from whoever created the game.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <form onSubmit={handleJoinGame} className="stack stack--tight">
              {error && <div className="alert alert--error">{error}</div>}

              <div className="field">
                <label className="label" htmlFor="inviteCode">
                  Invite code
                </label>
                <input
                  className="input input--ticker"
                  id="inviteCode"
                  type="text"
                  maxLength={10}
                  placeholder="A1B2C3"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>

              <div className="row">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Joining..." : "Join game"}
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
