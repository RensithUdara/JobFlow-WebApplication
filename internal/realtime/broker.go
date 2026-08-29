package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/redis/go-redis/v9"
)

const RedisChannel = "jobflow:events"

type Publisher interface {
	Publish(event string, payload any)
}

type Broker struct {
	mu      sync.RWMutex
	clients map[chan []byte]struct{}
}

func NewBroker() *Broker {
	return &Broker{clients: map[chan []byte]struct{}{}}
}

func (b *Broker) Publish(event string, payload any) {
	body, _ := json.Marshal(map[string]any{"event": event, "data": payload})
	b.publishRaw(body)
}

func (b *Broker) publishRaw(body []byte) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for client := range b.clients {
		select {
		case client <- body:
		default:
		}
	}
}

func (b *Broker) SubscribeRedis(ctx context.Context, client *redis.Client) {
	pubsub := client.Subscribe(ctx, RedisChannel)
	defer pubsub.Close()
	for msg := range pubsub.Channel() {
		b.publishRaw([]byte(msg.Payload))
	}
}

func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	client := make(chan []byte, 16)
	b.mu.Lock()
	b.clients[client] = struct{}{}
	b.mu.Unlock()
	defer func() {
		b.mu.Lock()
		delete(b.clients, client)
		b.mu.Unlock()
		close(client)
	}()

	flusher, _ := w.(http.Flusher)
	for {
		select {
		case <-r.Context().Done():
			return
		case msg := <-client:
			_, _ = fmt.Fprintf(w, "data: %s\n\n", msg)
			if flusher != nil {
				flusher.Flush()
			}
		}
	}
}

type RedisPublisher struct {
	client *redis.Client
}

func NewRedisPublisher(client *redis.Client) *RedisPublisher {
	return &RedisPublisher{client: client}
}

func (p *RedisPublisher) Publish(event string, payload any) {
	body, _ := json.Marshal(map[string]any{"event": event, "data": payload})
	_ = p.client.Publish(context.Background(), RedisChannel, body).Err()
}
