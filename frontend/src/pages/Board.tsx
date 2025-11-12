import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
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

  // criação
  const [creatingForStatus, setCreatingForStatus] =
    useState<Task["status"] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // edição (modal)
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("BACKLOG");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // drag and drop
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Task["status"] | null>(
    null
  );

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

  function startCreate(status: Task["status"]) {
    setCreatingForStatus(status);
    setNewTitle("");
    setNewDescription("");
  }

  function cancelCreate() {
    setCreatingForStatus(null);
    setNewTitle("");
    setNewDescription("");
    setIsCreating(false);
  }

  async function handleCreateSubmit(e: any) {
    e.preventDefault();
    if (!creatingForStatus) return;
    if (!newTitle.trim()) {
      alert("O título é obrigatório.");
      return;
    }

    try {
      setIsCreating(true);
      const created = await createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        status: creatingForStatus,
      });

      setTasks((prev) => [...prev, created]);
      cancelCreate();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tarefa. Tente novamente.");
      setIsCreating(false);
    }
  }

  async function handleDeleteTask(id: number) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta tarefa?"
    );
    if (!confirmDelete) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir tarefa.");
    }
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
  }

  function closeEdit() {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleEditSubmit(e: any) {
    e.preventDefault();
    if (!editingTask) return;
    if (!editTitle.trim()) {
      alert("O título é obrigatório.");
      return;
    }

    try {
      setIsSavingEdit(true);
      const updated = await updateTask(editingTask.id!, {
        ...editingTask,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      closeEdit();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  // drag and drop helpers
  function handleDragStart(id: number) {
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverStatus(null);
  }

  async function handleDropOnColumn(status: Task["status"]) {
    if (draggingId == null) return;
    await handleStatusChange(draggingId, status);
    setDraggingId(null);
    setDragOverStatus(null);
  }

  return (
    <>
      <div className="board">
        <header className="board-header">
          <div className="board-header-left">
            <h1 className="board-title">Kanban</h1>
            <span className="board-subtitle">Veritas</span>
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

                <div
                  className={
                    "column-body" +
                    (dragOverStatus === id ? " column-body-drag-over" : "")
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggingId != null) {
                      setDragOverStatus(id);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (dragOverStatus === id) {
                      setDragOverStatus(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnColumn(id);
                  }}
                >
                  {columnTasks.map((t) => (
                    <article
                      key={t.id}
                      className="task-card"
                      draggable
                      onDragStart={() => handleDragStart(t.id!)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-card-header">
                        <div className="task-title">{t.title}</div>
                        <div className="task-card-actions">
                          <button
                            type="button"
                            className="edit-task-button"
                            onClick={() => openEdit(t)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-task-button"
                            onClick={() => handleDeleteTask(t.id!)}
                            aria-label="Excluir tarefa"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {t.description && (
                        <div className="task-description">
                          {t.description}
                        </div>
                      )}

                      <select
                        className="status-select"
                        value={t.status}
                        onChange={(e) =>
                          handleStatusChange(
                            t.id!,
                            e.target.value as Task["status"]
                          )
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
                    <form
                      className="new-task-form"
                      onSubmit={handleCreateSubmit}
                    >
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
                          onClick={cancelCreate}
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
                      onClick={() => startCreate(id)}
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

      {/* MODAL DE EDIÇÃO */}
      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit task</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeEdit}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>
                    <span className="modal-label">Title</span>
                    <input
                      className="new-task-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </label>
                </div>

                <div className="modal-field">
                  <label>
                    <span className="modal-label">Description</span>
                    <textarea
                      className="new-task-textarea"
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </label>
                </div>

                <div className="modal-field">
                  <label>
                    <span className="modal-label">Status</span>
                    <select
                      className="status-select"
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as Task["status"])
                      }
                    >
                      {STATUS_CONFIG.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={closeEdit}
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}