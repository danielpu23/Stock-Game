import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResults } from "../api/gameApi";
import type { GameResult } from "../types/result";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";

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
    <Layout>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#333", marginBottom: "2rem" }}>Game Results</h1>
        {results === null ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : (
          <div>
            {results.length > 0 && (
              <>
                <Card 
                  title="🏆 Winner" 
                  style={{ 
                    marginBottom: "2rem",
                    backgroundColor: "#fff8e1",
                    borderColor: "#ffd700"
                  }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                    {results[0].username}
                  </div>
                  <div style={{ color: "#666", marginTop: "0.5rem" }}>
                    Total Value: ${results[0].totalValue.toFixed(2)}
                  </div>
                </Card>

                <Card title="Final Standings">
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "12px 8px", textAlign: "left" }}>Rank</th>
                        <th style={{ padding: "12px 8px", textAlign: "left" }}>Username</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Cash</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Holdings</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            borderBottom: "1px solid #ddd",
                            backgroundColor: index === 0 ? "#fff8e1" : "transparent"
                          }}
                        >
                          <td style={{ padding: "12px 8px", fontWeight: "bold" }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "12px 8px" }}>{result.username}</td>
                          <td style={{ padding: "12px 8px", textAlign: "right" }}>
                            ${result.cashBalance.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right" }}>
                            ${result.holdingsValue.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "bold" }}>
                            ${result.totalValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>

                <div style={{ marginTop: "2rem" }}>
                  <Button as="a" href="/" variant="primary">
                    Back to Menu
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
