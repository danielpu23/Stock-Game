import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResults } from "../api/gameApi";
import type { GameResult } from "../types/result";
import Navbar from "../components/Navbar";

export default function ResultsPage() {
  const { gameId } = useParams();
  const [results, setResults] = useState<GameResult[] | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await getResults(Number(gameId));
        setResults(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadResults();
  }, [gameId]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Game Results</h1>
        {results === null ? (
          <p>Loading...</p>
        ) : (
          <div>
            {results.length > 0 && (
              <div>
                <h2>Winner: {results[0].username}</h2>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>Rank</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Username</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "8px" }}>{index + 1}</td>
                        <td style={{ padding: "8px" }}>{result.username}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>
                          ${result.totalValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
