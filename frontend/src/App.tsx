import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CreateGamePage from "./pages/CreateGamePage";
import JoinGamePage from "./pages/JoinGamePage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/create" element={<CreateGamePage />} />

      <Route path="/join" element={<JoinGamePage />} />

      <Route path="/games/:gameId/lobby" element={<LobbyPage />} />

      <Route path="/games/:gameId" element={<GamePage />} />

      <Route path="/games/:gameId/results" element={<ResultsPage />} />
    </Routes>
  );
}
