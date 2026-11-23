import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Layout from "../components/ui/Layout";

export default function HomePage() {
  return (
    <Layout>
      <Navbar />
      <div className="container" style={{ maxWidth: "800px" }}>
        <Card>
          <h1 className="text-primary mb-2">Stock Game</h1>
          <p className="text-secondary mb-8">Welcome to the Stock Game!</p>

          <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
            <Button as="a" href="/create" variant="primary" data-testid="create-game-btn">Create Game</Button>
            <Button as="a" href="/join" variant="success" data-testid="join-game-btn">Join Game</Button>
            <Button as="a" href="/my-games" variant="secondary" data-testid="my-games-btn">My Games</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
