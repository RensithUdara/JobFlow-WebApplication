package model

import (
	"encoding/json"
	"time"
)

const (
	StatusQueued    = "queued"
	StatusRunning   = "running"
	StatusCompleted = "completed"
	StatusFailed    = "failed"
	StatusCancelled = "cancelled"
	StatusRetrying  = "retrying"
	StatusDLQ       = "dead_letter"
)

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Company      *string   `json:"company,omitempty"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Job struct {
	ID           string          `json:"id"`
	UserID       *string         `json:"user_id,omitempty"`
	QueueName    string          `json:"queue"`
	Type         string          `json:"type"`
	Payload      json.RawMessage `json:"payload"`
	Status       string          `json:"status"`
	Priority     int             `json:"priority"`
	Attempts     int             `json:"attempts"`
	MaxAttempts  int             `json:"max_attempts"`
	ErrorMessage *string         `json:"error_message,omitempty"`
	ScheduledAt  *time.Time      `json:"scheduled_at,omitempty"`
	StartedAt    *time.Time      `json:"started_at,omitempty"`
	CompletedAt  *time.Time      `json:"completed_at,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

type Worker struct {
	ID            string    `json:"id"`
	Hostname      string    `json:"hostname"`
	Status        string    `json:"status"`
	LastHeartbeat time.Time `json:"last_heartbeat"`
	JobsProcessed int       `json:"jobs_processed"`
	JobsFailed    int       `json:"jobs_failed"`
	CreatedAt     time.Time `json:"created_at"`
}

type QueueStats struct {
	Name       string `json:"name"`
	Waiting    int64  `json:"waiting"`
	Processing int64  `json:"processing"`
	DLQ        int64  `json:"dead_letter"`
}

type DashboardStats struct {
	TotalJobs int64            `json:"total_jobs"`
	Queued    int64            `json:"queued"`
	Running   int64            `json:"running"`
	Completed int64            `json:"completed"`
	Failed    int64            `json:"failed"`
	Retrying  int64            `json:"retrying"`
	DLQ       int64            `json:"dead_letter"`
	Queues    []QueueStats     `json:"queues"`
	Workers   []Worker         `json:"workers"`
	ByType    map[string]int64 `json:"by_type"`
}
