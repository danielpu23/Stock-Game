import { logout, getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="flex gap-4">
        <Button onClick={() => navigate("/")} variant="primary" data-testid="menu-btn">
          🏠 Menu
        </Button>
        <h3 className="navbar-brand">Stock Game</h3>
      </div>
      <div className="flex gap-4">
        {user && (
          <span className="font-semibold text-secondary">
            Welcome, {user.username}
          </span>
        )}
        <Button onClick={logout} variant="danger" data-testid="logout-btn">
          Logout
        </Button>
      </div>
    </nav>
  );
}