import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import type { Task } from "../api/tasks";

const STATUS_CONFIG: { id: Task["status"]; label: string }[] = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "To Do" },
  { id: "DOING", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    getTasks().then(setTasks).catch(console.error);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTasks = tasks.filter((t) => {
    if (!normalizedSearch) return true;

    const title = t.title.toLowerCase();
    const description = (t.description || "").toLowerCase();

    return (
      title.includes(normalizedSearch) || description.includes(normalizedSearch)
    );
  });

  function toggleSort() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="board">
      <header className="board-header">
        <div className="board-header-left">
          <h1 className="board-title">Kanban</h1>
          <span className="board-subtitle">Project Name · Team Name</span>
        </div>

        <div className="board-header-right">
          <input
            className="search-input"
            placeholder="Search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="secondary-button" onClick={toggleSort}>
            {sortOrder === "asc" ? "Sort A–Z" : "Sort Z–A"}
          </button>
        </div>
      </header>

      <section className="columns">
        {STATUS_CONFIG.map(({ id, label }) => {
          const columnTasks = filteredTasks
            .filter((t) => t.status === id)
            .slice() // copia pra não mexer no array original
            .sort((a, b) => {
              const aTitle = a.title.toLowerCase();
              const bTitle = b.title.toLowerCase();

              if (aTitle < bTitle) return sortOrder === "asc" ? -1 : 1;
              if (aTitle > bTitle) return sortOrder === "asc" ? 1 : -1;
              return 0;
            });

          return (
            <div key={id} className="column">
              <div className="column-header">
                <span className="column-title">{label}</span>
                <span className="column-count">{columnTasks.length}</span>
              </div>

              <div className="column-body">
                {columnTasks.map((t) => (
                  <article key={t.id} className="task-card">
                    <div className="task-title">{t.title}</div>
                    {t.description && (
                      <div className="task-description">{t.description}</div>
                    )}
                  </article>
                ))}

                <button className="add-task-button">+ New</button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
