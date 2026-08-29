package worker

import (
	"context"
	"log"
	"math"
	"os"
	"time"

	"jobflow/internal/model"
	"jobflow/internal/queue"
	"jobflow/internal/realtime"
	"jobflow/internal/repository"
)

type Pool struct {
	id        string
	hostname  string
	count     int
	queues    []string
	timeout   time.Duration
	queue     *queue.RedisQueue
	jobs      *repository.JobRepository
	workers   *repository.WorkerRepository
	processor *Processor
	events    realtime.Publisher
}

func NewPool(id string, count int, queues []string, timeout time.Duration, q *queue.RedisQueue, jobs *repository.JobRepository, workers *repository.WorkerRepository, events realtime.Publisher) *Pool {
	hostname, _ := os.Hostname()
	if id == "" {
		id = hostname + "-" + time.Now().Format("20060102150405")
	}
	return &Pool{
		id: id, hostname: hostname, count: count, queues: queues, timeout: timeout,
		queue: q, jobs: jobs, workers: workers, processor: NewProcessor(), events: events,
	}
}

func (p *Pool) Start(ctx context.Context) {
	for i := 0; i < p.count; i++ {
		go p.loop(ctx, i+1)
	}
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		_ = p.workers.Heartbeat(ctx, p.id, p.hostname, "online")
		select {
		case <-ctx.Done():
			_ = p.workers.Heartbeat(context.Background(), p.id, p.hostname, "offline")
			return
		case <-ticker.C:
		}
	}
}

func (p *Pool) loop(ctx context.Context, n int) {
	for {
		_, jobID, err := p.queue.Dequeue(ctx, p.queues)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("worker %d dequeue error: %v", n, err)
			continue
		}
		p.handle(ctx, jobID)
	}
}

func (p *Pool) handle(ctx context.Context, jobID string) {
	job, err := p.jobs.MarkRunning(ctx, jobID)
	if err != nil {
		return
	}
	p.events.Publish("job.running", job)
	jobCtx, cancel := context.WithTimeout(ctx, p.timeout)
	err = p.processor.Process(jobCtx, job)
	cancel()
	if err == nil {
		_ = p.jobs.MarkCompleted(ctx, job.ID)
		_ = p.workers.IncrementProcessed(ctx, p.id, false)
		p.events.Publish("job.completed", map[string]string{"id": job.ID})
		return
	}
	failedJob, failErr := p.jobs.MarkFailed(ctx, job.ID, err.Error())
	if failErr != nil {
		log.Printf("failed marking job %s failed: %v", job.ID, failErr)
		return
	}
	_ = p.workers.IncrementProcessed(ctx, p.id, true)
	if failedJob.Status == model.StatusRetrying {
		delay := time.Duration(math.Pow(2, float64(failedJob.Attempts-1))) * time.Second
		_ = p.queue.EnqueueAfter(ctx, failedJob, delay)
		p.events.Publish("job.retrying", failedJob)
		return
	}
	_ = p.queue.DeadLetter(ctx, failedJob)
	p.events.Publish("job.dead_letter", failedJob)
}
