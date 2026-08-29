# JobFlow Architecture

JobFlow is split into three runtime parts:

- API server
- Worker process
- React dashboard

## High-Level Flow

```text
React Dashboard
      |
      v
Go API Server
      |
      +--> PostgreSQL stores users, jobs, workers, and job state
      |
      +--> Redis stores queued work and realtime events
               |
               v
          Worker Pool
```

## Backend Layers

```text
cmd/
  api/       Starts the HTTP server
  worker/    Starts worker processing

internal/
  config/    Loads environment variables
  database/  Creates PostgreSQL and Redis clients
  handler/   Handles HTTP requests
  service/   Holds business logic
  repository/Data access layer
  queue/     Redis queue logic
  worker/    Worker pool and processors
  realtime/  Redis pub/sub and Server-Sent Events bridge
```

## Job Lifecycle

1. A user creates a job from the dashboard.
2. The API validates and stores the job in PostgreSQL.
3. The API pushes the job into Redis.
4. A worker pulls the job from Redis.
5. The worker marks the job as running.
6. The worker runs the processor for the job type.
7. The job is marked completed, retrying, failed, cancelled, or dead-letter.
8. Realtime events are published to Redis.
9. The dashboard receives updates over Server-Sent Events.

## Queue Strategy

Redis is used for fast queue operations. PostgreSQL remains the source of truth for durable state.

This means:

- Redis decides what should run next.
- PostgreSQL records what happened.
- Workers can be restarted without losing job history.

## Scheduling And Retries

The API starts a scheduler loop. On each interval it promotes:

- Jobs scheduled for now or earlier
- Jobs that are ready to retry

Workers apply timeout and retry rules using values from `.env`.

## Realtime Events

Realtime updates use Redis pub/sub and Server-Sent Events:

```text
Worker/API -> Redis pub/sub -> API SSE broker -> React EventSource
```

