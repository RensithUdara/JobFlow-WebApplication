import React from "react";
import { PieChart } from "lucide-react";

export function TypeChart({ stats }) {
  const entries = Object.entries(stats?.by_type || {});
  const total = Math.max(1, entries.reduce((sum, [, count]) => sum + count, 0));

  return (
    <section className="panel type-chart">
      <div className="panel-title"><PieChart size={18} /><h3>Job Types</h3></div>
      {entries.map(([type, count]) => (
        <div className="type-row" key={type}>
          <span>{type}</span>
          <div className="bar"><span style={{ width: `${(count / total) * 100}%` }} /></div>
          <strong>{count}</strong>
        </div>
      ))}
      {entries.length === 0 && <p className="empty">Create jobs to populate this chart.</p>}
    </section>
  );
}
