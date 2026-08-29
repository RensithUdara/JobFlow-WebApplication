import React from "react";
import { TimerReset } from "lucide-react";
import { titleize } from "../utils/format.js";

export function TypeChart({ stats, detailed = false }) {
  const entries = Object.entries(stats?.by_type || {});
  const total = Math.max(1, entries.reduce((sum, [, count]) => sum + count, 0));

  return (
    <section className={`panel type-chart ${detailed ? "type-chart-detailed" : ""}`}>
      <div className="panel-title">
        <div className="metric-icon panel-icon"><TimerReset size={18} /></div>
        <div><h3>Job Types</h3><span>Distribution by processor</span></div>
      </div>
      {entries.map(([type, count]) => (
        <div className="type-row" key={type}>
          <span>{titleize(type)}</span>
          <div className="bar"><span style={{ width: `${(count / total) * 100}%` }} /></div>
          <strong>{count}</strong>
          {detailed && <em>{Math.round((count / total) * 100)}%</em>}
        </div>
      ))}
      {entries.length === 0 && <p className="empty">Create jobs to populate this chart.</p>}
    </section>
  );
}
