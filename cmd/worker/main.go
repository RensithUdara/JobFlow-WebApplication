package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"jobflow/internal/config"
	"jobflow/internal/database"
	"jobflow/internal/queue"
	"jobflow/internal/realtime"
	"jobflow/internal/repository"
	"jobflow/internal/worker"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	cfg := config.Load()

	db, err := database.NewPostgres(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := database.Migrate(ctx, db); err != nil {
		log.Fatal(err)
	}
	redisClient, err := database.NewRedis(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatal(err)
	}
	defer redisClient.Close()

	pool := worker.NewPool(
		cfg.WorkerID,
		cfg.WorkerCount,
		cfg.WorkerQueues,
		cfg.JobTimeout,
		queue.NewRedisQueue(redisClient),
		repository.NewJobRepository(db),
		repository.NewWorkerRepository(db),
		realtime.NewRedisPublisher(redisClient),
	)

	log.Printf("JobFlow worker listening to %v with %d goroutines", cfg.WorkerQueues, cfg.WorkerCount)
	pool.Start(ctx)
}
