import React from "react";
import { Activity, CheckCircle2, Clock, Play, RotateCcw, XCircle } from "lucide-react";

export function StatsStrip({ stats, health }) {
  const items = [
    ["Total", stats?.total_jobs || 0, "All jobs", Activity],
    ["Queued", stats?.queued || 0, "Waiting in queue", Clock],
    ["Running", stats?.running || 0, "Currently running", Play],
    ["Completed", stats?.completed || 0, "Successfully completed", CheckCircle2],
    ["Retrying", stats?.retrying || 0, "Being retried", RotateCcw],
    ["Failed", (stats?.failed || 0) + (stats?.dead_letter || 0), "Failed jobs", XCircle],
  ];

  return (
    <section className="stats-strip">
      {items.map(([label, value, helper, Icon]) => (
        <div className="metric" key={label}>
          <div className="metric-icon"><Icon size={18} /></div>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{helper}</small>
          </div>
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
