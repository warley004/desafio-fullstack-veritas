import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask } from "../api/tasks";
import type { Task } from "../api/tasks";

const STATUS_CONFIG: { id: Task["status"]; label: string }[] = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "To Do" },
  { id: "DOING", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

interface BoardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Board({ darkMode, toggleDarkMode }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [creatingForStatus, setCreatingForStatus] =
    useState<Task["status"] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  async function handleStatusChange(id: number, newStatus: Task["status"]) {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updated = await updateTask(id, { ...task, status: newStatus });

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status da tarefa.");
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatingForStatus || !newTitle.trim()) return;
    try {
      setIsCreating(true);
      const created = await createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        status: creatingForStatus,
      });
      setTasks((prev) => [...prev, created]);
      setCreatingForStatus(null);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tarefa.");
    } finally {
      setIsCreating(false);
    }
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
          <button className="secondary-button" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <section className="columns">
        {STATUS_CONFIG.map(({ id, label }) => {
          const columnTasks = filteredTasks
            .filter((t) => t.status === id)
            .slice()
            .sort((a, b) => {
              const aTitle = a.title.toLowerCase();
              const bTitle = b.title.toLowerCase();
              if (aTitle < bTitle) return sortOrder === "asc" ? -1 : 1;
              if (aTitle > bTitle) return sortOrder === "asc" ? 1 : -1;
              return 0;
            });

          const isCreatingHere = creatingForStatus === id;

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

                    {/* seletor de status */}
                    <select
                      className="status-select"
                      value={t.status}
                      onChange={(e) =>
                        handleStatusChange(t.id!, e.target.value as Task["status"])
                      }
                    >
                      {STATUS_CONFIG.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}

                {isCreatingHere ? (
                  <form className="new-task-form" onSubmit={handleCreateSubmit}>
                    <input
                      className="new-task-input"
                      placeholder="Task title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                    />
                    <textarea
                      className="new-task-textarea"
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                    />
                    <div className="new-task-actions">
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={isCreating}
                      >
                        {isCreating ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => setCreatingForStatus(null)}
                        disabled={isCreating}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="add-task-button"
                    type="button"
                    onClick={() => setCreatingForStatus(id)}
                  >
                    + New
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
