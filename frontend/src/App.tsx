import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./utils/auth";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreateGamePage from "./pages/CreateGamePage";
import JoinGamePage from "./pages/JoinGamePage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateGamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/join"
        element={
          <ProtectedRoute>
            <JoinGamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/:gameId/lobby"
        element={
          <ProtectedRoute>
            <LobbyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/:gameId"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/:gameId/results"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
