import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CreateGamePage from "./pages/CreateGamePage";
import JoinGamePage from "./pages/JoinGamePage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/create" element={<CreateGamePage />} />

        <Route path="/join" element={<JoinGamePage />} />

        <Route path="/lobby/:gameId" element={<LobbyPage />} />

        <Route path="/game/:gameId" element={<GamePage />} />

        <Route path="/results/:gameId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
