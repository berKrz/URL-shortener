<h1 align="center">URL Shortener</h1>

<p align="center">
  A full-stack URL shortener supporting auto-generated and custom short codes.
  <br/>
  <br/>
  Um encurtador de URLs full-stack com suporte a códigos gerados automaticamente e personalizados.
</p>

<hr style="background-color: white">

## About / Sobre

A web application for shortening URLs, built with a modern stack and focused on simplicity. Short codes are auto-generated using Base62 encoding applied to an auto-incremented integer ID. Users can also define a custom short code, as long as it is not already taken. URL history is stored locally in the user's browser — no authentication required.

---

Aplicação web para encurtar URLs, construída com uma arquitetura moderna e focada em simplicidade. Os códigos curtos são gerados via codificação Base62 aplicada a um ID auto-incremental. O usuário também pode definir um código personalizado, desde que ainda não esteja em uso. O histórico é armazenado localmente no navegador — sem necessidade de autenticação.

<hr style="background-color: white">

## Tech Stack / Tecnologias

| Layer / Camada | Technology / Tecnologia |
|---|---|
| Frontend | Vue.js |
| Backend | PHP · Laravel |
| Database / Banco de dados | PostgreSQL |
| History / Histórico | LocalStorage (browser / navegador) |
| Containers / Contêineres | Docker · Docker Compose |

<hr style="background-color: white">

## Features / Funcionalidades

- ✅ Automatic URL shortening via Base62
- ✅ Custom short code creation
- ✅ HTTP 301 redirect
- ✅ Frontend and backend URL validation
- ✅ Browser-side URL history

---

- ✅ Encurtamento automático de URLs via Base62
- ✅ Criação de códigos curtos personalizados
- ✅ Redirecionamento HTTP 301
- ✅ Validação de URLs no frontend e no backend
- ✅ Histórico de URLs no navegador

<hr style="background-color: white">

## Database Schema

```sql
CREATE TABLE urls (
    id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    short_url    VARCHAR(15) NOT NULL UNIQUE,
    original_url TEXT        NOT NULL
);
```

>Auto-generated codes are at most 6 characters long (Base62 of an integer). Custom codes must be between 7 and 15 characters. All codes are case-sensitive.
>
>Códigos gerados automaticamente têm no máximo 6 caracteres (Base62 de um inteiro). Códigos personalizados devem ter entre 7 e 15 caracteres. Todos os códigos são *case-sensitive*.

<hr style="background-color: white">

## Running Locally / Executando Localmente

> **EN-US:** Prerequisites: [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
>
> **PT-BR:** Pré-requisitos: [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

```bash
# EN-US: Clone the repository / PT-BR: Clone o repositório
git clone https://github.com/berKrz/url-shortener.git
cd url-shortener

# EN-US: Copy the environment file and start all containers
# PT-BR: Copie o arquivo de ambiente e inicie todos os contêineres
cp .env.example .env
docker compose up --build
```

> **EN-US:** The app will be available at `http://localhost:8000`. The database is provisioned automatically via Docker.
>
> **PT-BR:** A aplicação estará disponível em `http://localhost:8000`. O banco de dados é provisionado automaticamente pelo Docker.
