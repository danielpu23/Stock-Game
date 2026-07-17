import { useEffect } from "react";
import { getGame } from "./api/gameApi";

function App() {
  useEffect(() => {
    async function loadGame() {
      try {
        const game = await getGame(1);
        console.log(game);
      } catch (error) {
        console.error(error);
      }
    }

    loadGame();
  }, []);

  return <h1>Stock Game</h1>;
}

export default App;
