import { useNavigate } from "react-router-dom";

import { logout, getUser } from "../utils/auth";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button className="navbar__brand" onClick={() => navigate("/")}>
        <span className="navbar__mark">SG</span>
        Stock Game
      </button>

      <div className="navbar__right">
        {user && (
          <span className="navbar__user">
            Signed in as <strong>{user.username}</strong>
          </span>
        )}
        <button className="btn btn--ghost btn--sm" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
