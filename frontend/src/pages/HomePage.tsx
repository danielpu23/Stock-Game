import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <h1>Stock Game</h1>

      <Link to="/create">
        <button>Create Game</button>
      </Link>

      <Link to="/join">
        <button>Join Game</button>
      </Link>
    </div>
  );
}
