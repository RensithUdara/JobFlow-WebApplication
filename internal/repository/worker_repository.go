package repository

import (
	"context"

	"jobflow/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkerRepository struct {
	db *pgxpool.Pool
}

func NewWorkerRepository(db *pgxpool.Pool) *WorkerRepository {
	return &WorkerRepository{db: db}
}

func (r *WorkerRepository) Heartbeat(ctx context.Context, id, hostname, status string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO workers (id, hostname, status, last_heartbeat)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (id) DO UPDATE
		SET hostname = EXCLUDED.hostname, status = EXCLUDED.status, last_heartbeat = NOW()
	`, id, hostname, status)
	return err
}

func (r *WorkerRepository) IncrementProcessed(ctx context.Context, id string, failed bool) error {
	field := "jobs_processed = jobs_processed + 1"
	if failed {
		field = "jobs_failed = jobs_failed + 1"
	}
	_, err := r.db.Exec(ctx, `UPDATE workers SET `+field+`, last_heartbeat = NOW() WHERE id = $1`, id)
	return err
}

func (r *WorkerRepository) List(ctx context.Context) ([]model.Worker, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, hostname, status, last_heartbeat, jobs_processed, jobs_failed, created_at
		FROM workers
		ORDER BY last_heartbeat DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	workers := []model.Worker{}
	for rows.Next() {
		var worker model.Worker
		if err := rows.Scan(&worker.ID, &worker.Hostname, &worker.Status, &worker.LastHeartbeat, &worker.JobsProcessed, &worker.JobsFailed, &worker.CreatedAt); err != nil {
			return nil, err
		}
		workers = append(workers, worker)
	}
	return workers, rows.Err()
}
