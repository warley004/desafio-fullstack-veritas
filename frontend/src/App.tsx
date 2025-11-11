import "./App.css";
import Board from "./pages/Board";

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">▢</div>

        <nav className="sidebar-nav">
          <button className="sidebar-item active">⌂</button>
          <button className="sidebar-item">☰</button>
          <button className="sidebar-item">▤</button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">⚙</button>
        </div>
      </aside>

      <main className="board-wrapper">
        <Board />
      </main>
    </div>
  );
}
