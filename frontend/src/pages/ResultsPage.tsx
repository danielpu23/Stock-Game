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
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 className="text-primary mb-8">Game Results</h1>
        {results === null ? (
          <p className="text-secondary">Loading...</p>
        ) : (
          <div>
            {results.length > 0 && (
              <>
                <Card
                  title="🏆 Winner"
                  className="winner-card"
                  style={{ marginBottom: "2rem" }}
                >
                  <div className="text-2xl font-bold text-primary">
                    {results[0].username}
                  </div>
                  <div className="text-secondary mt-2">
                    Total Value: ${results[0].totalValue.toFixed(2)}
                  </div>
                </Card>

                <Card title="Final Standings">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th className="text-right">Cash</th>
                        <th className="text-right">Holdings</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr
                          key={index}
                          className={index === 0 ? "table-row-winner" : ""}
                        >
                          <td className="font-bold">{index + 1}</td>
                          <td>{result.username}</td>
                          <td className="text-right">
                            ${result.cashBalance.toFixed(2)}
                          </td>
                          <td className="text-right">
                            ${result.holdingsValue.toFixed(2)}
                          </td>
                          <td className="text-right font-bold">
                            ${result.totalValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>

                <div className="mt-8">
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
