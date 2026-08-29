import React from "react";
import { GitBranch, TimerReset } from "lucide-react";

export function QueueBoard({ stats }) {
  const queues = stats?.queues || [];
  const maxWaiting = Math.max(1, ...queues.map((queue) => queue.waiting));

  return (
    <section className="panel queue-board">
      <div className="panel-title"><GitBranch size={18} /><h3>Queue Depth</h3></div>
      <div className="queue-list">
        {queues.map((queue) => (
          <div className="queue-card" key={queue.name}>
            <div>
              <strong>{queue.name}</strong>
              <span>{queue.waiting} waiting</span>
            </div>
            <div className="bar"><span style={{ width: `${Math.max(5, (queue.waiting / maxWaiting) * 100)}%` }} /></div>
          </div>
        ))}
        {queues.length === 0 && <p className="empty">Queue metrics will appear after the API connects to Redis.</p>}
      </div>
      <div className="dlq-card"><TimerReset size={16} /> Dead-letter entries: {stats?.dead_letter || 0}</div>
    </section>
  );
}
