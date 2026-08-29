import React from "react";
import { ChevronRight, GitBranch, TimerReset, TriangleAlert } from "lucide-react";
import { queueDisplayName } from "../utils/format.js";

export function QueueBoard({ stats, detailed = false }) {
  const queues = stats?.queues || [];
  const maxWaiting = Math.max(1, ...queues.map((queue) => queue.waiting));

  return (
    <section className={`panel queue-board ${detailed ? "queue-board-detailed" : ""}`}>
      <div className="panel-title">
        <div className="metric-icon panel-icon"><GitBranch size={18} /></div>
        <div><h3>Queue Depth</h3><span>Jobs waiting in each queue</span></div>
      </div>
      <div className="queue-list">
        {queues.map((queue) => (
          <div className="queue-card" key={queue.name}>
            <div>
              <strong>{queueDisplayName(queue.name)}</strong>
              <span>{queue.waiting} waiting</span>
            </div>
            <div className="bar"><span style={{ width: `${Math.max(5, (queue.waiting / maxWaiting) * 100)}%` }} /></div>
            {detailed && <ChevronRight className="queue-arrow" size={22} />}
          </div>
        ))}
        {queues.length === 0 && <p className="empty">Queue metrics will appear after the API connects to Redis.</p>}
      </div>
      <div className="dlq-card">
        <TriangleAlert size={18} />
        <strong>Dead-letter entries: {stats?.dead_letter || 0}</strong>
        {detailed && <span>View details <ChevronRight size={18} /></span>}
      </div>
    </section>
  );
}
