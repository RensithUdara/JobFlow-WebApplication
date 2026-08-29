package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"jobflow/internal/middleware"
	"jobflow/internal/service"

	"github.com/gin-gonic/gin"
)

type JobHandler struct {
	jobs *service.JobService
}

func NewJobHandler(jobs *service.JobService) *JobHandler {
	return &JobHandler{jobs: jobs}
}

type createJobRequest struct {
	Queue       string          `json:"queue"`
	Type        string          `json:"type" binding:"required"`
	Payload     json.RawMessage `json:"payload"`
	Priority    int             `json:"priority"`
	MaxAttempts int             `json:"max_attempts"`
	ScheduledAt *time.Time      `json:"scheduled_at"`
}

func (h *JobHandler) Create(c *gin.Context) {
	var req createJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	job, err := h.jobs.Create(c.Request.Context(), service.CreateJobInput{
		UserID: middleware.UserID(c), Queue: req.Queue, Type: req.Type, Payload: req.Payload,
		Priority: req.Priority, MaxAttempts: req.MaxAttempts, ScheduledAt: req.ScheduledAt,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, job)
}

func (h *JobHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	jobs, err := h.jobs.List(c.Request.Context(), middleware.UserID(c), c.Query("status"), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *JobHandler) Get(c *gin.Context) {
	job, err := h.jobs.Find(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}
	if job.UserID == nil || *job.UserID != middleware.UserID(c) {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}
	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) Cancel(c *gin.Context) {
	if err := h.jobs.Cancel(c.Request.Context(), c.Param("id"), middleware.UserID(c)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *JobHandler) Retry(c *gin.Context) {
	job, err := h.jobs.Retry(c.Request.Context(), c.Param("id"), middleware.UserID(c))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) Dashboard(c *gin.Context) {
	stats, err := h.jobs.Dashboard(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *JobHandler) Queues(c *gin.Context) {
	stats, err := h.jobs.QueueStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *JobHandler) Workers(c *gin.Context) {
	workers, err := h.jobs.Workers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workers)
}
