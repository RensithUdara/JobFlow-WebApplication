import React, { useMemo } from "react";
import { Activity, AlertTriangle, Gauge, Timer } from "lucide-react";

function secondsBetween(start, end) {
  if (!start || !end) return null;
  const seconds = (new Date(end) - new Date(start)) / 1000;
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

export function JobAnalytics({ jobs }) {
  const analytics = useMemo(() => {
    const completedDurations = jobs
      .map((job) => secondsBetween(job.started_at, job.completed_at))
      .filter((value) => value !== null);
    const averageDuration = completedDurations.length
      ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length
      : null;
    const retryPressure = jobs.filter((job) => job.status === "retrying" || job.attempts > 0).length;
    const failed = jobs.filter((job) => job.status === "failed" || job.status === "dead_letter").length;
    const scheduled = jobs.filter((job) => job.scheduled_at && new Date(job.scheduled_at) > new Date()).length;

    return {
      averageDuration: averageDuration === null ? "N/A" : `${averageDuration.toFixed(2)}s`,
      retryPressure,
      failureRisk: jobs.length ? `${Math.round((failed / jobs.length) * 100)}%` : "0%",
      scheduled,
    };
  }, [jobs]);

  const cards = [
    { label: "Avg Runtime", value: analytics.averageDuration, icon: Timer },
    { label: "Retry Pressure", value: analytics.retryPressure, icon: Gauge },
    { label: "Failure Risk", value: analytics.failureRisk, icon: AlertTriangle },
    { label: "Scheduled", value: analytics.scheduled, icon: Activity },
  ];

  return (
    <section className="panel analytics-panel">
      <div className="panel-title">
        <div className="metric-icon panel-icon"><Gauge size={18} /></div>
        <div><h3>Job Analytics</h3><span>Operational signals from recent jobs</span></div>
      </div>
      <div className="analytics-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="analytics-card" key={label}>
            <Icon size={17} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
