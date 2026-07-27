import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Stock Game</h1>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <Link to="/create">
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Create Game
            </button>
          </Link>

          <Link to="/join">
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Join Game
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
