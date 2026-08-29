# JobFlow API Reference

Base URL:

```text
http://localhost:8080
```

Protected routes require:

```http
Authorization: Bearer <token>
```

## Health

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Rensith Udara",
  "email": "rensith@example.com",
  "company": "JobFlow Labs",
  "password": "password123",
  "confirm_password": "password123"
}
```

## Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "rensith@example.com",
  "password": "password123"
}
```

## Create Job

```http
POST /api/jobs
```

Request:

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

## List Jobs

```http
GET /api/jobs?limit=100
```

Optional query params:

| Name | Description |
| --- | --- |
| `limit` | Number of jobs to return |
| `status` | Filter by job status |

## Get Job

```http
GET /api/jobs/:id
```

## Cancel Job

```http
POST /api/jobs/:id/cancel
```

Alternative:

```http
DELETE /api/jobs/:id
```

## Retry Job

```http
POST /api/jobs/:id/retry
```

## Dashboard Stats

```http
GET /api/dashboard
```

## Queue Stats

```http
GET /api/queues
```

## Worker Stats

```http
GET /api/workers
```

## Realtime Events

```http
GET /api/events
```

The frontend connects with `EventSource`.

## Job Status Values

```text
queued
running
completed
failed
cancelled
retrying
dead_letter
```

