import React from "react";
import { Activity, CheckCircle2, Clock, Play, RotateCcw, XCircle } from "lucide-react";

export function StatsStrip({ stats, health }) {
  const items = [
    ["Total", stats?.total_jobs || 0, Activity],
    ["Queued", stats?.queued || 0, Clock],
    ["Running", stats?.running || 0, Play],
    ["Completed", stats?.completed || 0, CheckCircle2],
    ["Retrying", stats?.retrying || 0, RotateCcw],
    ["Failed", (stats?.failed || 0) + (stats?.dead_letter || 0), XCircle],
  ];

  return (
    <section className="stats-strip">
      {items.map(([label, value, Icon]) => (
        <div className="metric" key={label}>
          <Icon size={18} />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      <div className="metric accent">
        <span>Success rate</span>
        <strong>{health.successRate}%</strong>
        <small>{health.activeWorkers} active workers</small>
      </div>
    </section>
  );
}
