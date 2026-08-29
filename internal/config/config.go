package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Env              string
	ServerPort       string
	DatabaseURL      string
	RedisURL         string
	JWTSecret        string
	AllowedOrigin    string
	WorkerID         string
	WorkerQueues     []string
	WorkerCount      int
	JobTimeout       time.Duration
	SchedulerInterval time.Duration
}

func Load() Config {
	return Config{
		Env:              get("APP_ENV", "development"),
		ServerPort:       get("SERVER_PORT", "8080"),
		DatabaseURL:      get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/jobflow?sslmode=disable"),
		RedisURL:         get("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:        get("JWT_SECRET", "dev-secret-change-me"),
		AllowedOrigin:    get("ALLOWED_ORIGIN", "http://localhost:5173"),
		WorkerID:         get("WORKER_ID", ""),
		WorkerQueues:     split(get("WORKER_QUEUES", "emails,images,webhooks,reports,default")),
		WorkerCount:      getInt("WORKER_COUNT", 4),
		JobTimeout:       time.Duration(getInt("JOB_TIMEOUT_SECONDS", 30)) * time.Second,
		SchedulerInterval: time.Duration(getInt("SCHEDULER_INTERVAL_SECONDS", 5)) * time.Second,
	}
}

func get(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getInt(key string, fallback int) int {
	value, err := strconv.Atoi(get(key, ""))
	if err != nil {
		return fallback
	}
	return value
}

func split(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
