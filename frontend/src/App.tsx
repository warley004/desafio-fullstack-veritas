import { useEffect, useState } from "react";
import "./App.css";
import Board from "./pages/Board";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // aplica classe no body
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const BoardAny = Board as any;

  return (
    <div className="app">
      <main className="board-wrapper">
        <BoardAny
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((d) => !d)}
        />
      </main>
    </div>
  );
}
