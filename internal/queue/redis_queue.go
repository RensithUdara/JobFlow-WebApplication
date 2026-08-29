package queue

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"jobflow/internal/model"

	"github.com/redis/go-redis/v9"
)

type RedisQueue struct {
	client *redis.Client
}

func NewRedisQueue(client *redis.Client) *RedisQueue {
	return &RedisQueue{client: client}
}

func QueueKey(name string) string {
	return "queue:" + name
}

func (q *RedisQueue) Enqueue(ctx context.Context, job model.Job) error {
	score := float64(-job.Priority)*1_000_000_000 + float64(time.Now().UnixMilli())
	return q.client.ZAdd(ctx, QueueKey(job.QueueName), redis.Z{
		Score:  score,
		Member: job.ID,
	}).Err()
}

func (q *RedisQueue) EnqueueAfter(ctx context.Context, job model.Job, delay time.Duration) error {
	return q.client.ZAdd(ctx, "scheduled:retries", redis.Z{
		Score:  float64(time.Now().Add(delay).Unix()),
		Member: job.ID,
	}).Err()
}

func (q *RedisQueue) PromoteRetries(ctx context.Context, fetchJob func(context.Context, string) (model.Job, error)) error {
	ids, err := q.client.ZRangeByScore(ctx, "scheduled:retries", &redis.ZRangeBy{
		Min: "-inf",
		Max: strconv.FormatInt(time.Now().Unix(), 10),
	}).Result()
	if err != nil {
		return err
	}
	for _, id := range ids {
		job, err := fetchJob(ctx, id)
		if err == nil {
			_ = q.Enqueue(ctx, job)
		}
		_ = q.client.ZRem(ctx, "scheduled:retries", id).Err()
	}
	return nil
}

func (q *RedisQueue) Dequeue(ctx context.Context, queues []string) (string, string, error) {
	for {
		for _, name := range queues {
			items, err := q.client.ZPopMin(ctx, QueueKey(name), 1).Result()
			if err != nil {
				return "", "", err
			}
			if len(items) > 0 {
				id, ok := items[0].Member.(string)
				if !ok {
					return "", "", fmt.Errorf("invalid job id in redis queue")
				}
				return name, id, nil
			}
		}
		select {
		case <-ctx.Done():
			return "", "", ctx.Err()
		case <-time.After(500 * time.Millisecond):
		}
	}
}

func (q *RedisQueue) DeadLetter(ctx context.Context, job model.Job) error {
	return q.client.LPush(ctx, "queue:dead-letter", job.ID).Err()
}

func (q *RedisQueue) Stats(ctx context.Context, queues []string) ([]model.QueueStats, error) {
	stats := make([]model.QueueStats, 0, len(queues))
	dlq, _ := q.client.LLen(ctx, "queue:dead-letter").Result()
	for _, name := range queues {
		waiting, err := q.client.ZCard(ctx, QueueKey(name)).Result()
		if err != nil {
			return nil, err
		}
		stats = append(stats, model.QueueStats{Name: name, Waiting: waiting, DLQ: dlq})
	}
	return stats, nil
}
