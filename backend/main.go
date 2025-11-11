package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	// Rota de saúde
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "OK")
	})

	// Rotas da API de tarefas
	mux.HandleFunc("/tasks", tasksHandler)
	mux.HandleFunc("/tasks/", taskByIDHandler)

	port := ":8080"
	log.Printf("Servidor backend rodando em http://localhost%v\n", port)

	if err := http.ListenAndServe(port, withCORS(mux)); err != nil {
		log.Fatalf("erro ao subir servidor: %v", err)
	}
}

// Middleware simples de CORS, pra liberar o frontend depois
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
