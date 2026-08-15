import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";

export default function HomePage() {
  return (
    <Layout>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <Card>
          <h1 style={{ color: "#333", marginBottom: "0.5rem" }}>Stock Game</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>Welcome to the Stock Game!</p>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button as="a" href="/create" variant="primary" data-testid="create-game-btn">Create Game</Button>
            <Button as="a" href="/join" variant="success" data-testid="join-game-btn">Join Game</Button>
            <Button as="a" href="/my-games" variant="secondary" data-testid="my-games-btn">My Games</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
