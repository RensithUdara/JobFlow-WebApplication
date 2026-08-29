package worker

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"jobflow/internal/model"
)

type Processor struct {
	httpClient *http.Client
}

func NewProcessor() *Processor {
	return &Processor{httpClient: &http.Client{Timeout: 10 * time.Second}}
}

func (p *Processor) Process(ctx context.Context, job model.Job) error {
	switch job.Type {
	case "send_email", "send_notification", "resize_image", "generate_report", "process_data":
		return simulate(ctx, job)
	case "send_webhook":
		return p.webhook(ctx, job)
	default:
		return fmt.Errorf("unknown job type %q", job.Type)
	}
}

func simulate(ctx context.Context, job model.Job) error {
	var payload map[string]any
	_ = json.Unmarshal(job.Payload, &payload)
	if fail, _ := payload["force_fail"].(bool); fail {
		return errors.New("payload requested failure")
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-time.After(time.Duration(400+job.Priority*30) * time.Millisecond):
		return nil
	}
}

func (p *Processor) webhook(ctx context.Context, job model.Job) error {
	var payload struct {
		URL    string         `json:"url"`
		Method string         `json:"method"`
		Body   map[string]any `json:"body"`
	}
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return err
	}
	if payload.URL == "" {
		return errors.New("webhook url is required")
	}
	method := payload.Method
	if method == "" {
		method = http.MethodPost
	}
	body, _ := json.Marshal(payload.Body)
	req, err := http.NewRequestWithContext(ctx, method, payload.URL, strings.NewReader(string(body)))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := p.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return fmt.Errorf("webhook returned %s", resp.Status)
	}
	return nil
}
