import React from "react";
import { CalendarDays, RefreshCcw } from "lucide-react";
import { QueueBoard } from "../components/QueueBoard.jsx";
import { TypeChart } from "../components/TypeChart.jsx";

export function QueuesView({ stats, refresh, loading }) {
  return (
    <div className="queues-view">
      <div className="view-heading">
        <div>
          <h2>Queue Monitor</h2>
          <p>Monitor queue depth and job distribution</p>
          <span className="signed-line"><CalendarDays size={18} /> Signed in session | {new Date().toLocaleDateString()}</span>
        </div>
        <button className="secondary refresh-button" onClick={refresh}>
          <RefreshCcw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <div className="queue-monitor-grid">
        <QueueBoard stats={stats} detailed />
        <TypeChart stats={stats} detailed />
      </div>
    </div>
  );
}
