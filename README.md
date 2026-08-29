<p align="center">
  <img src="web/public/logo.png" alt="JobFlow logo" width="180" />
</p>

# 🚀 JobFlow

**JobFlow** is a full-stack background job queue system built with **Go**, **Gin**, **PostgreSQL**, **Redis**, and **React**. It gives you a professional operations dashboard for creating jobs, monitoring queues, tracking workers, retrying failures, and inspecting realtime queue activity.

---

## ✨ Features

### 🔐 Authentication

- User registration with name, email, company, password, and confirm password
- Login with JWT authentication
- Protected API routes
- Clean sign-out flow with custom confirmation popup

### 📦 Job Queue

- Create jobs with custom JSON payloads
- Multiple queues: emails, images, webhooks, reports, default
- Priority-based queueing
- Batch job creation
- Scheduled jobs
- Retry flow with exponential backoff
- Dead-letter queue support
- Cancel and retry jobs
- Custom confirmation popup for destructive actions

### 🧑‍🏭 Worker System

- Separate worker process
- Configurable worker count
- Worker heartbeat tracking
- Worker status dashboard
- Jobs processed and failed counters
- Queue subscription configuration

### 📊 React Dashboard

- Professional responsive operations UI
- Dashboard, Jobs, Queues, Workers, and Settings pages
- Light and dark themes
- Fixed sidebar with scrollable workspace
- Job analytics panel
- Queue depth monitor
- Job type distribution chart
- Health and success-rate cards
- Realtime event feed using Server-Sent Events
- Job details with timeline
- Search, filters, sorting, pagination, export
- Saved job drafts
- Import JSON into the job composer
- Keyboard shortcuts:
  - `Ctrl + K` focus search
  - `Ctrl + N` focus create job
  - `Ctrl + R` refresh data

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Go, Gin |
| Database | PostgreSQL |
| Queue / Cache | Redis |
| Auth | JWT, bcrypt |
| Realtime | Server-Sent Events |
| Frontend | React, Vite |
| UI Icons | Lucide React |
| DevOps | Docker, Docker Compose |

---

## 📁 Project Structure

```text
JobFlow/
  cmd/
    api/                 Go API entry point
    worker/              Worker process entry point
  internal/
    config/              Environment configuration
    database/            PostgreSQL and Redis connections
    handler/             HTTP handlers
    middleware/          JWT middleware
    model/               Data models
    queue/               Redis queue implementation
    realtime/            SSE broker
    repository/          Database repositories
    service/             Business logic
    worker/              Worker pool and processors
  migrations/
    001_init.sql         Database schema
  web/
    public/
      logo.png           README logo
      jobflow-logo.png   App logo
    src/
      api/               API client helpers
      components/        Reusable UI components
      data/              Job templates and options
      hooks/             React hooks
      utils/             Display formatters
      views/             Dashboard pages
  .env.example
  docker-compose.yml
  Dockerfile
  README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

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

Create `web/.env` for the frontend:

```env
VITE_API_URL=http://localhost:8080
```

### 🔑 Variable Guide

| Variable | Description |
| --- | --- |
| `APP_ENV` | App environment, usually `development` |
| `SERVER_PORT` | API server port |
| `DATABASE_URL` | PostgreSQL connection URL |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `ALLOWED_ORIGIN` | Frontend URL allowed by CORS |
| `WORKER_ID` | Optional custom worker name |
| `WORKER_QUEUES` | Queues the worker should process |
| `WORKER_COUNT` | Number of concurrent workers |
| `JOB_TIMEOUT_SECONDS` | Max processing time for a job |
| `SCHEDULER_INTERVAL_SECONDS` | Scheduled/retry promotion interval |
| `VITE_API_URL` | API URL used by React |

---

## 🐳 Run With Docker

Start the full stack:

```bash
docker compose up --build
```

Start only PostgreSQL and Redis:

```bash
docker compose up postgres redis
```

Stop containers:

```bash
docker compose down
```

Remove database volume too:

```bash
docker compose down -v
```

---

## 💻 Run Locally

### 1. Install dependencies

```bash
go mod download
cd web
npm install
cd ..
```

### 2. Start PostgreSQL and Redis

Using Docker:

```bash
docker compose up postgres redis
```

Or use local services if PostgreSQL and Redis are installed on your machine.

### 3. Create the database

```bash
psql -U postgres
```

Inside `psql`:

```sql
CREATE DATABASE jobflow;
\q
```

Test the connection:

```bash
psql "postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable"
```

### 4. Run migrations

```bash
psql "postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable" -f migrations/001_init.sql
```

### 5. Start the API

```bash
go run ./cmd/api
```

API URL:

```text
http://localhost:8080
```

### 6. Start workers

Open another terminal:

```bash
go run ./cmd/worker
```

### 7. Start the React dashboard

Open another terminal:

```bash
cd web
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🪟 Windows Redis Note

If Redis is installed with `winget` and PowerShell does not recognize `redis-server`, restart PowerShell first.

Then run:

```powershell
redis-server
```

Check Redis:

```powershell
redis-cli ping
```

Expected response:

```text
PONG
```

---

## 🧪 Testing And Build Commands

Run backend tests:

```bash
go test ./...
```

Build frontend:

```bash
cd web
npm run build
```

Preview frontend build:

```bash
cd web
npm run preview
```

---

## 🔌 API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
```

### Jobs

```http
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
DELETE /api/jobs/:id
POST   /api/jobs/:id/retry
POST   /api/jobs/:id/cancel
```

### Dashboard

```http
GET /api/dashboard
GET /api/queues
GET /api/workers
GET /api/events
```

---

## 📨 Example Requests

### Register

```json
{
  "name": "Rensith Udara",
  "email": "rensith@example.com",
  "company": "JobFlow Labs",
  "password": "password123",
  "confirm_password": "password123"
}
```

### Login

```json
{
  "email": "rensith@example.com",
  "password": "password123"
}
```

### Create Job

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

### Scheduled Job

```json
{
  "queue": "reports",
  "type": "generate_report",
  "priority": 2,
  "max_attempts": 3,
  "scheduled_at": "2026-08-29T18:30:00Z",
  "payload": {
    "report": "monthly_revenue",
    "format": "pdf",
    "account": "Operations Team"
  }
}
```

---

## 🧰 Supported Job Types

| Type | Queue | Purpose |
| --- | --- | --- |
| `send_email` | `emails` | Simulate sending an email |
| `resize_image` | `images` | Simulate image resizing |
| `send_notification` | `default` | Simulate notification delivery |
| `generate_report` | `reports` | Simulate report generation |
| `send_webhook` | `webhooks` | Send a webhook request |
| `process_data` | `default` | Simulate data processing |

---

## 🧠 How JobFlow Works

1. 👤 A user logs in or creates an account.
2. 📝 The dashboard sends a job creation request to the Go API.
3. 🗄️ The API stores the job in PostgreSQL.
4. 📬 The API pushes the job into Redis by queue and priority.
5. 🧑‍🏭 Worker processes pull jobs from Redis.
6. ⚙️ The worker executes the correct processor.
7. ✅ Completed jobs are marked as completed.
8. 🔁 Failed jobs are retried with backoff.
9. 🪦 Jobs that exceed max attempts move to the dead-letter queue.
10. 📡 The UI receives realtime updates through Server-Sent Events.

---

## 🖥️ Frontend Highlights

- `DashboardView.jsx` shows operations metrics and live job controls.
- `JobsView.jsx` gives focused job management.
- `QueuesView.jsx` shows queue depth and job distribution.
- `WorkersView.jsx` monitors worker heartbeat status.
- `SettingsView.jsx` controls theme, density, export, and refresh.
- `JobComposer.jsx` supports templates, JSON import, drafts, scheduling, and batch creation.
- `ConfirmDialog.jsx` provides custom confirmation popups.
- `JobAnalytics.jsx` summarizes runtime and failure signals.

---

## 🛡️ Security Notes

- Change `JWT_SECRET` before production use.
- Do not commit real `.env` secrets.
- Keep PostgreSQL and Redis protected from public internet access.
- Use HTTPS and a proper reverse proxy in production.
- Use a strong database password outside local development.

---

## 🚀 Production Notes

For production deployments:

- Build the React app with `npm run build`.
- Serve `web/dist` using Nginx or another static file server.
- Run the Go API as a long-running service.
- Run one or more worker processes separately.
- Use managed PostgreSQL and Redis if possible.
- Set `ALLOWED_ORIGIN` to the real frontend domain.
- Use a long random `JWT_SECRET`.

---

## 📌 Useful Commands

```bash
# Backend
go run ./cmd/api
go run ./cmd/worker
go test ./...

# Frontend
cd web
npm install
npm run dev
npm run build
npm run preview

# Docker
docker compose up --build
docker compose down
docker compose down -v
```

---

## 📄 License

This project is for learning, portfolio, and backend/frontend practice. Add your preferred license before publishing publicly.

