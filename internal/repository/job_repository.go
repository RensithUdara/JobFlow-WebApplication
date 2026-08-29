package repository

import (
	"context"
	"encoding/json"
	"time"

	"jobflow/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type JobRepository struct {
	db *pgxpool.Pool
}

func NewJobRepository(db *pgxpool.Pool) *JobRepository {
	return &JobRepository{db: db}
}

type CreateJobParams struct {
	UserID      string
	QueueName   string
	Type        string
	Payload     json.RawMessage
	Priority    int
	MaxAttempts int
	ScheduledAt *time.Time
}

func (r *JobRepository) Create(ctx context.Context, p CreateJobParams) (model.Job, error) {
	status := model.StatusQueued
	if p.ScheduledAt != nil && p.ScheduledAt.After(time.Now().UTC()) {
		status = "scheduled"
	}
	var job model.Job
	err := r.db.QueryRow(ctx, `
		INSERT INTO jobs (user_id, queue_name, job_type, payload, status, priority, max_attempts, scheduled_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		          max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
	`, p.UserID, p.QueueName, p.Type, p.Payload, status, p.Priority, p.MaxAttempts, p.ScheduledAt).Scan(
		&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
		&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
		&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
	)
	return job, err
}

func (r *JobRepository) List(ctx context.Context, userID, status string, limit int) ([]model.Job, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	args := []any{userID, limit}
	filter := ""
	if status != "" {
		filter = "AND status = $3"
		args = append(args, status)
	}
	rows, err := r.db.Query(ctx, `
		SELECT id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		       max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
		FROM jobs
		WHERE user_id = $1 `+filter+`
		ORDER BY created_at DESC
		LIMIT $2
	`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanJobs(rows)
}

func (r *JobRepository) Find(ctx context.Context, id string) (model.Job, error) {
	var job model.Job
	err := r.db.QueryRow(ctx, `
		SELECT id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		       max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
		FROM jobs
		WHERE id = $1
	`, id).Scan(
		&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
		&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
		&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
	)
	return job, err
}

func (r *JobRepository) Cancel(ctx context.Context, id, userID string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE jobs
		SET status = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3 AND status IN ($4, 'scheduled', $5)
	`, model.StatusCancelled, id, userID, model.StatusQueued, model.StatusRetrying)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *JobRepository) MarkRunning(ctx context.Context, id string) (model.Job, error) {
	var job model.Job
	err := r.db.QueryRow(ctx, `
		UPDATE jobs
		SET status = $1, attempts = attempts + 1, started_at = NOW(), updated_at = NOW()
		WHERE id = $2 AND status IN ($3, $4)
		RETURNING id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		          max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
	`, model.StatusRunning, id, model.StatusQueued, model.StatusRetrying).Scan(
		&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
		&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
		&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
	)
	return job, err
}

func (r *JobRepository) MarkCompleted(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE jobs
		SET status = $1, error_message = NULL, completed_at = NOW(), updated_at = NOW()
		WHERE id = $2
	`, model.StatusCompleted, id)
	return err
}

func (r *JobRepository) MarkFailed(ctx context.Context, id, message string) (model.Job, error) {
	var job model.Job
	err := r.db.QueryRow(ctx, `
		UPDATE jobs
		SET status = CASE WHEN attempts < max_attempts THEN $1 ELSE $2 END,
		    error_message = $3,
		    updated_at = NOW()
		WHERE id = $4
		RETURNING id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		          max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
	`, model.StatusRetrying, model.StatusDLQ, message, id).Scan(
		&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
		&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
		&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
	)
	return job, err
}

func (r *JobRepository) Requeue(ctx context.Context, id, userID string) (model.Job, error) {
	var job model.Job
	err := r.db.QueryRow(ctx, `
		UPDATE jobs
		SET status = $1, error_message = NULL, updated_at = NOW()
		WHERE id = $2 AND user_id = $5 AND status IN ($3, $4)
		RETURNING id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		          max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
	`, model.StatusQueued, id, model.StatusFailed, model.StatusDLQ, userID).Scan(
		&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
		&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
		&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
	)
	return job, err
}

func (r *JobRepository) ReadyScheduled(ctx context.Context, limit int) ([]model.Job, error) {
	rows, err := r.db.Query(ctx, `
		UPDATE jobs
		SET status = $1, updated_at = NOW()
		WHERE id IN (
			SELECT id FROM jobs
			WHERE status = 'scheduled' AND scheduled_at <= NOW()
			ORDER BY scheduled_at ASC
			LIMIT $2
		)
		RETURNING id::text, user_id::text, queue_name, job_type, payload, status, priority, attempts,
		          max_attempts, error_message, scheduled_at, started_at, completed_at, created_at, updated_at
	`, model.StatusQueued, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanJobs(rows)
}

func (r *JobRepository) Stats(ctx context.Context) (map[string]int64, map[string]int64, error) {
	statusRows, err := r.db.Query(ctx, `SELECT status, COUNT(*) FROM jobs GROUP BY status`)
	if err != nil {
		return nil, nil, err
	}
	defer statusRows.Close()
	byStatus := map[string]int64{}
	var total int64
	for statusRows.Next() {
		var status string
		var count int64
		if err := statusRows.Scan(&status, &count); err != nil {
			return nil, nil, err
		}
		byStatus[status] = count
		total += count
	}
	byStatus["total"] = total

	typeRows, err := r.db.Query(ctx, `SELECT job_type, COUNT(*) FROM jobs GROUP BY job_type`)
	if err != nil {
		return nil, nil, err
	}
	defer typeRows.Close()
	byType := map[string]int64{}
	for typeRows.Next() {
		var typ string
		var count int64
		if err := typeRows.Scan(&typ, &count); err != nil {
			return nil, nil, err
		}
		byType[typ] = count
	}
	return byStatus, byType, nil
}

func scanJobs(rows pgx.Rows) ([]model.Job, error) {
	jobs := []model.Job{}
	for rows.Next() {
		var job model.Job
		if err := rows.Scan(
			&job.ID, &job.UserID, &job.QueueName, &job.Type, &job.Payload, &job.Status, &job.Priority,
			&job.Attempts, &job.MaxAttempts, &job.ErrorMessage, &job.ScheduledAt, &job.StartedAt,
			&job.CompletedAt, &job.CreatedAt, &job.UpdatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, rows.Err()
}
