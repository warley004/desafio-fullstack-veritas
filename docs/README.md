# Kanban Fullstack - Desafio Tecnico Veritas

Aplicacao Kanban fullstack criada para o desafio tecnico da Veritas. O projeto entrega uma experiencia de board profissional com CRUD completo, drag and drop, modal de edicao, filtros, ordenacao alfabetica, dark mode e persistencia local em JSON. O visual foi refinado para refletir a identidade da Veritas: paleta sobria, acentos quentes e tipografia moderna.

## Sumario

- [Visao Geral](#visao-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pre-requisitos](#pre-requisitos)
- [Guia Rapido](#guia-rapido)
  - [Backend (Go)](#backend-go)
  - [Frontend (React--vite)](#frontend-react--vite)
- [API REST](#api-rest)
- [Persistencia e Estado](#persistencia-e-estado)
- [Funcionalidades](#funcionalidades)
- [Destaques Extras](#destaques-extras)
- [Decisoes Tecnicas](#decisoes-tecnicas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Testes Rapidos](#testes-rapidos)
- [Diagramas](#diagramas)
- [Proximos Passos](#proximos-passos)
- [Licenca e Creditos](#licenca-e-creditos)

## Visao Geral

- **Objetivo:** disponibilizar um Kanban responsivo, acessivel e alinhado ao branding da Veritas.
- **Escopo:** frontend em React + TypeScript (Vite) e backend em Go, comunicando via API REST.
- **Destaques:** experiencia rica (drag and drop, modal, busca, ordenacao), dark mode refinado e persistencia automatica em arquivo JSON.

## Arquitetura

| Camada      | Descricao |
|-------------|-----------|
| **Frontend** | React + TypeScript (Vite). Consome a API, renderiza colunas, trata CRUD, busca, ordenacao e dark mode. Estilizacao com CSS e design tokens (`--v-*`). |
| **Backend**  | Go (`net/http`). API REST simples com armazenamento em memoria e persistencia automatica em `backend/data/tasks.json`. |
| **Persistencia** | Arquivo JSON versionado localmente. Carregado no start, salvo a cada mutacao via escrita atomica. |

## Tecnologias

- **Frontend:** React, TypeScript, Vite, CSS com variaveis de tema.
- **Backend:** Go 1.20+, `net/http`, `encoding/json`.
- **Outros:** HTML5 Drag and Drop, Fetch API, armazenamento JSON.

## Pre-requisitos

- Node.js **18+** e npm.
- Go **1.20+**.
- (Opcional) `curl` ou Postman para testar a API.

## Guia Rapido

Clone o repositorio e, em dois terminais diferentes, suba backend e frontend.

### Backend (Go)

```bash
cd backend
go run .
```

- Servidor: `http://localhost:8080`
- Endpoints: `/tasks`, `/tasks/{id}`
- Dados: `backend/data/tasks.json` (criado automaticamente)

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- Aplicacao: `http://localhost:5173`
- O frontend assume que a API esta em `http://localhost:8080`. Ajuste `BASE_URL` em `frontend/src/api/tasks.ts` se necessario.

## API REST

Todos os endpoints respondem e aceitam JSON.

### `GET /tasks`

- Lista todas as tarefas.
- Suporta filtro opcional `?status=BACKLOG|TODO|DOING|DONE`.
- **200 OK**

```json
[
	{
		"id": 1,
		"title": "Implementar Kanban",
		"description": "Criar colunas e cards",
		"status": "BACKLOG"
	}
]
```

### `POST /tasks`

- Cria uma tarefa.
- Campos: `title` (obrigatorio), `description` (opcional), `status` (opcional, default `BACKLOG`).
- **201 Created**

```json
{
	"id": 2,
	"title": "Novo card",
	"description": "Opcional",
	"status": "BACKLOG"
}
```

### `PUT /tasks/{id}`

- Atualiza titulo, descricao e status.
- **200 OK**

```json
{
	"id": 2,
	"title": "Titulo atualizado",
	"description": "Descricao atualizada",
	"status": "DOING"
}
```

### `DELETE /tasks/{id}`

- Remove a tarefa.
- **204 No Content**

## Persistencia e Estado

- O backend le `backend/data/tasks.json` no start e preenche a estrutura em memoria, incluindo o proximo ID.
- A cada criacao, edicao ou remocao, o arquivo e sobrescrito via escrita atomica (`*.tmp` + rename) para evitar corrompimento.
- Se preferir, ignore o arquivo no versionamento adicionando `backend/data/` ao `.gitignore`.

## Funcionalidades

- Quatro colunas fixas: **Backlog**, **To Do**, **In Progress**, **Done**.
- Criacao inline por coluna (`+ New`).
- Modal de edicao com titulo, descricao e status.
- Exclusao com confirmacao nativa (`window.confirm`).
- Mudanca de status por dropdown ou arraste entre colunas (HTML5 Drag and Drop).
- Busca textual (titulo e descricao) e ordenacao A->Z / Z->A por coluna.
- Dark mode com paleta azul-marinho e acento dourado, mantendo legibilidade.
- Feedback visual profissional para validacoes (titulo obrigatorio).

## Destaques Extras

- Drag and Drop nativo sem dependencias externas.
- Persistencia local em JSON com escrita segura.
- Dark mode refinado inspirado na identidade da Veritas.
- Busca e ordenacao como facilitadores de produtividade.

## Decisoes Tecnicas

- **Status restritos** (`BACKLOG`, `TODO`, `DOING`, `DONE`) para manter consistencia entre backend e UI.
- **Persistencia simples** (JSON) evita overhead de banco no contexto do desafio.
- **Drag and drop nativo** remove dependencia de bibliotecas e entrega o escopo desejado (sem reordenacao vertical por enquanto).
- **Design tokens CSS** (`--v-*`) permitem ajustes rapidos de tema e identidade visual.
- **UI focada** somente no fluxo principal, evitando features dispersivas (multi-board, etiquetas complexas etc.).

## Estrutura de Pastas

```text
.
├── backend
│   ├── main.go
│   ├── handlers.go
│   ├── models.go
│   └── data/
│       └── tasks.json        # gerado automaticamente
│
├── frontend
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── tasks.ts
│       ├── pages/
│       │   └── Board.tsx
│       ├── App.tsx
│       ├── App.css
│       └── index.css
│
└── docs
		├── user-flow.png
		├── data-flow.png
		└── README.md             # codigos Mermaid e notas
```

## Testes Rapidos

Use `curl` para validar os endpoints durante o desenvolvimento.

```bash
# Criar
curl -X POST http://localhost:8080/tasks \
	-H "Content-Type: application/json" \
	-d '{"title":"Estudar DnD","description":"Mover por drag and drop","status":"BACKLOG"}'

# Listar
curl http://localhost:8080/tasks

# Filtrar por status
curl "http://localhost:8080/tasks?status=DOING"

# Atualizar
curl -X PUT http://localhost:8080/tasks/1 \
	-H "Content-Type: application/json" \
	-d '{"title":"Estudar DnD","description":"Mover por drag and drop","status":"DOING"}'

# Excluir
curl -X DELETE http://localhost:8080/tasks/1
```

## Diagramas

- **Fluxo do usuario:** `docs/user-flow.png`
- **Fluxo de dados (Frontend <-> Backend <-> JSON):** `docs/data-flow.png`

Os PNGs foram exportados a partir dos codigos Mermaid presentes neste diretorio. Para editar, utilize https://mermaid.live e gere novas imagens.

## Licenca e Creditos

Projeto criado para fins de avaliacao tecnica. Pode ser utilizado livremente como material de estudo ou portfolio.

Feito com dedicacao por Warley — implementacao, refinamento visual e documentacao do zero.

