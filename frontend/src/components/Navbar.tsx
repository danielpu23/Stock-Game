import { logout, getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        backgroundColor: "white",
        padding: "1rem 2rem",
        borderBottom: "2px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Button onClick={() => navigate("/")} variant="primary">
          🏠 Menu
        </Button>
        <h3 style={{ margin: 0, color: "#333", fontSize: "1.5rem" }}>Stock Game</h3>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <span style={{ fontWeight: "600", color: "#555", fontSize: "1rem" }}>
            Welcome, {user.username}
          </span>
        )}
        <Button onClick={logout} variant="danger">
          Logout
        </Button>
      </div>
    </nav>
  );
}