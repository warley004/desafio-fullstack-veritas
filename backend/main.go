package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "OK")
	})

	port := ":8080"
	log.Printf("Servidor backend rodando em http://localhost%v\n", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("erro ao subir servidor: %v", err)
	}
}
