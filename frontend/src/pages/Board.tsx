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

  useEffect(() => {
    getTasks().then(setTasks).catch(console.error);
  }, []);

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
          />
          <button className="secondary-button">Filter</button>
          <button className="secondary-button">Sort</button>
          <button className="primary-button">+ New Board</button>
        </div>
      </header>

      <section className="columns">
        {STATUS_CONFIG.map(({ id, label }) => {
          const columnTasks = tasks.filter((t) => t.status === id);

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
