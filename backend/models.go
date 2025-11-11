package main

import (
	"errors"
	"fmt"
	"strings"
)

// Task representa uma tarefa do nosso mini Kanban.
type Task struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Status      string `json:"status"` // TODO, DOING ou DONE
}

const (
	StatusTodo  = "TODO"
	StatusDoing = "DOING"
	StatusDone  = "DONE"
)

var validStatuses = map[string]bool{
	StatusTodo:  true,
	StatusDoing: true,
	StatusDone:  true,
}

// Validate garante as regras básicas:
// - título obrigatório
// - status válido
func (t *Task) Validate() error {
	t.Title = strings.TrimSpace(t.Title)
	if t.Title == "" {
		return errors.New("título é obrigatório")
	}

	status := strings.ToUpper(strings.TrimSpace(t.Status))
	if !validStatuses[status] {
		return fmt.Errorf("status inválido: %s", t.Status)
	}

	// Normaliza o status para o formato canônico
	t.Status = status

	return nil
}
