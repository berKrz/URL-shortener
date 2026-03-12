# url-shortener

Encurtador de URLs full-stack com suporte a códigos gerados automaticamente e personalizados. O histórico de URLs fica armazenado localmente no navegador, sem necessidade de autenticação.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3 · Pinia · Vue Router · VueUse |
| Backend | Laravel 11 (API-only) |
| Banco de dados | PostgreSQL 16 |
| Histórico | `pinia-plugin-persistedstate` (localStorage) |
| Infraestrutura | Docker · Docker Compose |

---

## Como funciona

O backend expõe duas rotas:

- `POST /api/shorten` — recebe uma URL longa e devolve o código curto
- `GET /api/{shortUrl}` — redireciona para a URL original (HTTP 302)

Ao encurtar uma URL, o backend verifica se ela já existe na base. Se existir, devolve um 409 com o código já criado. O frontend apresenta a duplicata ao usuário, que pode usar o código existente ou forçar a criação de um novo.

Os códigos curtos gerados automaticamente usam codificação Base62 sobre o ID auto-incremental da tabela, resultando em strings de até 6 caracteres. Códigos personalizados devem ter entre 7 e 15 caracteres alfanuméricos — o comprimento mínimo garante que não colidam com os gerados automaticamente.

---

## Banco de dados

```sql
CREATE TABLE urls (
    id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    short_url    VARCHAR(15) NOT NULL UNIQUE,
    original_url TEXT        NOT NULL
);
```

A coluna `original_url` tem um índice hash para acelerar a verificação de duplicatas.

---

## Funcionalidades

- Encurtamento automático via Base62 (máx. 6 caracteres)
- Código personalizado (7–15 caracteres, case-sensitive)
- Detecção de duplicatas com opção de forçar novo código
- Validação no frontend e no backend
- Redirecionamento HTTP 302
- Histórico persistido no navegador
- Rate limiting: 20 req/min no endpoint de criação, 120 req/min nos redirecionamentos
- Headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`, etc.)

---

## Rodando localmente

Pré-requisitos: [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/).

```bash
git clone https://github.com/berKrz/url-shortener.git
cd url-shortener

cp .env.example .env
docker compose up --build
```

A aplicação sobe em `http://localhost:8000`. O banco é provisionado automaticamente pelo Docker, incluindo a execução das migrations.

---

## Estrutura dos serviços

```
backend   → porta 8000  (Laravel via artisan serve)
frontend  → porta 5173  (Vite dev server)
db        → porta 5432  (PostgreSQL)
```

O frontend se comunica com o backend via variável de ambiente `VITE_API_URL`. O CORS do backend aceita requisições apenas da origem configurada em `FRONTEND_URL`.