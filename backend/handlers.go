package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

// Armazenamento em memória (simples e direto)
// Depois a gente pode evoluir pra JSON em arquivo se der tempo.
var (
	tasks   = make([]Task, 0)
	nextID  int64 = 1
	tasksMu sync.Mutex
)

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("erro ao escrever resposta JSON: %v", err)
		}
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// /tasks  → GET (listar) e POST (criar)
func tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listTasks(w, r)
	case http.MethodPost:
		createTask(w, r)
	default:
		w.Header().Set("Allow", "GET, POST")
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
	}
}

// /tasks/{id} → PUT (atualizar) e DELETE (remover)
func taskByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "id da tarefa não informado")
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateTask(w, r, id)
	case http.MethodDelete:
		deleteTask(w, r, id)
	default:
		w.Header().Set("Allow", "PUT, DELETE")
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
	}
}

func listTasks(w http.ResponseWriter, r *http.Request) {
	tasksMu.Lock()
	defer tasksMu.Unlock()

	// opcional: filtro por status ?status=TODO
	statusFilter := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("status")))

	result := tasks
	if statusFilter != "" {
		filtered := make([]Task, 0, len(tasks))
		for _, t := range tasks {
			if strings.EqualFold(t.Status, statusFilter) {
				filtered = append(filtered, t)
			}
		}
		result = filtered
	}

	writeJSON(w, http.StatusOK, result)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var input Task
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	// Se não mandar status, cai em TODO por padrão
	if strings.TrimSpace(input.Status) == "" {
		input.Status = StatusTodo
	}

	if err := input.Validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tasksMu.Lock()
	defer tasksMu.Unlock()

	input.ID = nextID
	nextID++
	tasks = append(tasks, input)

	writeJSON(w, http.StatusCreated, input)
}

func updateTask(w http.ResponseWriter, r *http.Request, id int64) {
	var input Task
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	// Obrigamos mandar título e status na atualização
	if err := input.Validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tasksMu.Lock()
	defer tasksMu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Title = input.Title
			tasks[i].Description = input.Description
			tasks[i].Status = input.Status

			writeJSON(w, http.StatusOK, tasks[i])
			return
		}
	}

	writeError(w, http.StatusNotFound, "tarefa não encontrada")
}

func deleteTask(w http.ResponseWriter, r *http.Request, id int64) {
	tasksMu.Lock()
	defer tasksMu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			// remove o elemento i da slice
			tasks = append(tasks[:i], tasks[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	writeError(w, http.StatusNotFound, "tarefa não encontrada")
}
