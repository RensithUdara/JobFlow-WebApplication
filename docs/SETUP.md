# JobFlow Setup Guide

This guide explains how to run JobFlow locally with PostgreSQL, Redis, the Go API, the worker process, and the React dashboard.

## Requirements

- Go 1.23 or newer
- Node.js 20 or newer
- npm
- PostgreSQL
- Redis
- Docker Desktop, optional but recommended

## Environment Files

Create `.env` in the project root:

```env
APP_ENV=development
SERVER_PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=replace-me-with-a-long-random-secret
ALLOWED_ORIGIN=http://localhost:5173
WORKER_ID=
WORKER_QUEUES=emails,images,webhooks,reports,default
WORKER_COUNT=4
JOB_TIMEOUT_SECONDS=30
SCHEDULER_INTERVAL_SECONDS=5
```

Create `web/.env`:

```env
VITE_API_URL=http://localhost:8080
```

## Docker Setup

Run the full stack:

```bash
docker compose up --build
```

Run only PostgreSQL and Redis:

```bash
docker compose up postgres redis
```

Stop services:

```bash
docker compose down
```

## Manual Local Setup

Install dependencies:

```bash
go mod download
cd web
npm install
cd ..
```

Create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE jobflow;
\q
```

Run migrations:

```bash
psql "postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable" -f migrations/001_init.sql
```

Start the API:

```bash
go run ./cmd/api
```

Start the worker:

```bash
go run ./cmd/worker
```

Start the frontend:

```bash
cd web
npm run dev
```

Open:

```text
http://localhost:5173
```

