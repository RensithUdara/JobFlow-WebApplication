package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"jobflow/internal/config"
	"jobflow/internal/database"
	"jobflow/internal/handler"
	"jobflow/internal/middleware"
	"jobflow/internal/queue"
	"jobflow/internal/realtime"
	"jobflow/internal/repository"
	"jobflow/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	ctx := context.Background()
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

	events := realtime.NewBroker()
	users := repository.NewUserRepository(db)
	jobs := repository.NewJobRepository(db)
	workers := repository.NewWorkerRepository(db)
	redisQueue := queue.NewRedisQueue(redisClient)
	authSvc := service.NewAuthService(users, cfg.JWTSecret)
	jobSvc := service.NewJobService(jobs, workers, redisQueue, events, cfg.WorkerQueues)

	go func() {
		ticker := time.NewTicker(cfg.SchedulerInterval)
		defer ticker.Stop()
		for range ticker.C {
			if err := jobSvc.PromoteScheduled(ctx); err != nil {
				log.Printf("scheduler error: %v", err)
			}
		}
	}()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.AllowedOrigin},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	router.GET("/api/events", gin.WrapH(events))
	authHandler := handler.NewAuthHandler(authSvc)
	jobHandler := handler.NewJobHandler(jobSvc)

	api := router.Group("/api")
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)

	protected := api.Group("")
	protected.Use(middleware.Auth(authSvc))
	protected.POST("/jobs", jobHandler.Create)
	protected.GET("/jobs", jobHandler.List)
	protected.GET("/jobs/:id", jobHandler.Get)
	protected.DELETE("/jobs/:id", jobHandler.Cancel)
	protected.POST("/jobs/:id/cancel", jobHandler.Cancel)
	protected.POST("/jobs/:id/retry", jobHandler.Retry)
	protected.GET("/dashboard", jobHandler.Dashboard)
	protected.GET("/queues", jobHandler.Queues)
	protected.GET("/workers", jobHandler.Workers)

	log.Printf("JobFlow API listening on :%s", cfg.ServerPort)
	log.Fatal(router.Run(":" + cfg.ServerPort))
}
