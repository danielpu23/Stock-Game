import { logout, getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        backgroundColor: "#f8f9fa",
        padding: "1rem",
        borderBottom: "1px solid #dee2e6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🏠 Menu
        </button>
        <h3 style={{ margin: 0 }}>Stock Game</h3>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <span style={{ fontWeight: "bold" }}>
            Welcome, {user.username}
          </span>
        )}
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}