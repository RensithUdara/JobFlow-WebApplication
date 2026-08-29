# JobFlow

Distributed background job queue and worker system built with Go, Gin, PostgreSQL, Redis, and React.

## Features

- JWT authentication
- Job creation, listing, detail, cancellation, and retry
- Redis priority queues across multiple queue names
- Separate API and worker processes
- Concurrent worker pool with goroutines
- Scheduled jobs and retry promotion loop
- Exponential backoff retries and dead-letter queue
- Worker heartbeat tracking
- Server-Sent Events for dashboard refreshes
- React operations dashboard

## Run locally

Start infrastructure:

```bash
docker compose up postgres redis
```

Or run the whole stack:

```bash
docker compose up --build
```

Run the API:

```bash
go run ./cmd/api
```

Run workers in another terminal:

```bash
go run ./cmd/worker
```

Run the dashboard:

```bash
cd web
npm install
npm run dev
```

The dashboard opens at `http://localhost:5173`, and the API listens on `http://localhost:8080`.

## API

```http
POST /api/auth/register
POST /api/auth/login
POST /api/jobs
GET /api/jobs
GET /api/jobs/:id
DELETE /api/jobs/:id
POST /api/jobs/:id/retry
POST /api/jobs/:id/cancel
GET /api/dashboard
GET /api/events
```

Create a job:

```json
{
  "queue": "emails",
  "type": "send_email",
  "priority": 5,
  "max_attempts": 3,
  "payload": {
    "to": "user@example.com",
    "subject": "Welcome",
    "body": "Hello from JobFlow"
  }
}
```

Supported job types are `send_email`, `resize_image`, `send_notification`, `generate_report`, `send_webhook`, and `process_data`.
