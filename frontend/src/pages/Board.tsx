import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import type { Task } from "../api/tasks";

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks().then(setTasks).catch(console.error);
  }, []);

  const statuses: Task["status"][] = ["BACKLOG", "TODO", "DOING", "DONE"];

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      {statuses.map((status) => (
        <div key={status} style={{ flex: 1 }}>
          <h2>{status}</h2>
          <div
            style={{
              background: "#f4f4f4",
              borderRadius: "8px",
              minHeight: "200px",
              padding: "8px",
            }}
          >
            {tasks
              .filter((t) => t.status === status)
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "white",
                    borderRadius: "6px",
                    padding: "8px",
                    marginBottom: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <strong>{t.title}</strong>
                  <p style={{ fontSize: "0.9rem" }}>{t.description}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
