package service

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"jobflow/internal/model"
	"jobflow/internal/queue"
	"jobflow/internal/realtime"
	"jobflow/internal/repository"
)

type JobService struct {
	jobs    *repository.JobRepository
	workers *repository.WorkerRepository
	queue   *queue.RedisQueue
	events  realtime.Publisher
	queues  []string
}

type CreateJobInput struct {
	UserID      string
	Queue       string
	Type        string
	Payload     json.RawMessage
	Priority    int
	MaxAttempts int
	ScheduledAt *time.Time
}

func NewJobService(jobs *repository.JobRepository, workers *repository.WorkerRepository, queue *queue.RedisQueue, events realtime.Publisher, queues []string) *JobService {
	return &JobService{jobs: jobs, workers: workers, queue: queue, events: events, queues: queues}
}

func (s *JobService) Create(ctx context.Context, in CreateJobInput) (model.Job, error) {
	if in.Queue == "" {
		in.Queue = "default"
	}
	if in.Type == "" {
		return model.Job{}, errors.New("type is required")
	}
	if !json.Valid(in.Payload) || len(in.Payload) == 0 {
		in.Payload = json.RawMessage(`{}`)
	}
	if in.MaxAttempts == 0 {
		in.MaxAttempts = 3
	}
	job, err := s.jobs.Create(ctx, repository.CreateJobParams{
		UserID: in.UserID, QueueName: in.Queue, Type: in.Type, Payload: in.Payload,
		Priority: in.Priority, MaxAttempts: in.MaxAttempts, ScheduledAt: in.ScheduledAt,
	})
	if err != nil {
		return model.Job{}, err
	}
	if job.Status == model.StatusQueued {
		if err := s.queue.Enqueue(ctx, job); err != nil {
			return model.Job{}, err
		}
	}
	s.events.Publish("job.created", job)
	return job, nil
}

func (s *JobService) List(ctx context.Context, userID, status string, limit int) ([]model.Job, error) {
	return s.jobs.List(ctx, userID, status, limit)
}

func (s *JobService) Find(ctx context.Context, id string) (model.Job, error) {
	return s.jobs.Find(ctx, id)
}

func (s *JobService) Cancel(ctx context.Context, id, userID string) error {
	if err := s.jobs.Cancel(ctx, id, userID); err != nil {
		return err
	}
	s.events.Publish("job.cancelled", map[string]string{"id": id})
	return nil
}

func (s *JobService) Retry(ctx context.Context, id, userID string) (model.Job, error) {
	job, err := s.jobs.Requeue(ctx, id, userID)
	if err != nil {
		return model.Job{}, err
	}
	if err := s.queue.Enqueue(ctx, job); err != nil {
		return model.Job{}, err
	}
	s.events.Publish("job.retried", job)
	return job, nil
}

func (s *JobService) QueueStats(ctx context.Context) ([]model.QueueStats, error) {
	return s.queue.Stats(ctx, s.queues)
}

func (s *JobService) Workers(ctx context.Context) ([]model.Worker, error) {
	return s.workers.List(ctx)
}

func (s *JobService) Dashboard(ctx context.Context) (model.DashboardStats, error) {
	byStatus, byType, err := s.jobs.Stats(ctx)
	if err != nil {
		return model.DashboardStats{}, err
	}
	queues, err := s.queue.Stats(ctx, s.queues)
	if err != nil {
		return model.DashboardStats{}, err
	}
	workers, err := s.workers.List(ctx)
	if err != nil {
		return model.DashboardStats{}, err
	}
	return model.DashboardStats{
		TotalJobs: byStatus["total"],
		Queued:    byStatus[model.StatusQueued],
		Running:   byStatus[model.StatusRunning],
		Completed: byStatus[model.StatusCompleted],
		Failed:    byStatus[model.StatusFailed],
		Retrying:  byStatus[model.StatusRetrying],
		DLQ:       byStatus[model.StatusDLQ],
		Queues:    queues,
		Workers:   workers,
		ByType:    byType,
	}, nil
}

func (s *JobService) PromoteScheduled(ctx context.Context) error {
	jobs, err := s.jobs.ReadyScheduled(ctx, 100)
	if err != nil {
		return err
	}
	for _, job := range jobs {
		if err := s.queue.Enqueue(ctx, job); err != nil {
			return err
		}
		s.events.Publish("job.queued", job)
	}
	return s.queue.PromoteRetries(ctx, s.jobs.Find)
}
