# Troubleshooting

## API Cannot Connect To Redis

Error:

```text
dial tcp [::1]:6379: connectex: No connection could be made
```

Fix:

```bash
docker compose up redis
```

Or start local Redis:

```powershell
redis-server
```

Check Redis:

```powershell
redis-cli ping
```

Expected:

```text
PONG
```

## `redis-server` Is Not Recognized On Windows

After installing Redis with `winget`, restart PowerShell.

Then check:

```powershell
redis-server --version
```

## API Cannot Connect To PostgreSQL

Check PostgreSQL is running:

```bash
psql -U postgres
```

Create the database if missing:

```sql
CREATE DATABASE jobflow;
```

Test `DATABASE_URL`:

```bash
psql "postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable"
```

## Frontend Cannot Reach API

Check `web/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Check root `.env`:

```env
ALLOWED_ORIGIN=http://localhost:5173
```

Restart both API and frontend after changing env files.

## Login Fails

Make sure:

- API is running
- PostgreSQL is running
- migrations were applied
- email and password match an existing user

## Dashboard Does Not Update

Make sure:

- Redis is running
- API is running
- frontend uses the correct `VITE_API_URL`
- browser console has no CORS error

## Worker Does Not Process Jobs

Check:

```env
WORKER_QUEUES=emails,images,webhooks,reports,default
WORKER_COUNT=4
```

Then run:

```bash
go run ./cmd/worker
```

## Dark Theme Looks Wrong

Clear saved local settings in the browser:

```text
localStorage.removeItem("jobflow_theme")
localStorage.removeItem("jobflow_density")
```

Then refresh the app.

