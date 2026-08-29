import React from "react";
import { Clock3, Flame, RadioTower, TimerReset } from "lucide-react";

export function InsightCards({ jobs, stats }) {
  const waiting = (stats?.queues || []).reduce((sum, queue) => sum + queue.waiting, 0);
  const newest = jobs[0]?.created_at ? new Date(jobs[0].created_at).toLocaleTimeString() : "None";
  const hottestQueue = [...(stats?.queues || [])].sort((a, b) => b.waiting - a.waiting)[0];
  const retryLoad = (stats?.retrying || 0) + (stats?.dead_letter || 0);

  const cards = [
    { label: "Queue depth", value: waiting, icon: Flame },
    { label: "Newest job", value: newest, icon: Clock3 },
    { label: "Hot queue", value: hottestQueue?.name || "None", icon: RadioTower },
    { label: "Retry load", value: retryLoad, icon: TimerReset },
  ];

  return (
    <section className="insight-grid">
      {cards.map(({ label, value, icon: Icon }) => (
        <div className="insight-card" key={label}>
          <Icon size={18} />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}
