import React from "react";
import { Cpu, RadioTower } from "lucide-react";

export function WorkerBoard({ stats }) {
  const workers = stats?.workers || [];

  return (
    <section className="panel worker-board">
      <div className="panel-title split">
        <div className="title-inline"><RadioTower size={18} /><div><h3>Workers</h3><span>Worker heartbeat status</span></div></div>
      </div>
      <div className="worker-grid">
        {workers.map((worker) => (
          <div className="worker-card" key={worker.id}>
            <div className="worker-head"><span className={`dot ${worker.status}`} /><strong>{worker.hostname || worker.id.slice(0, 8)}</strong></div>
            <span>{worker.status}</span>
            <div className="worker-stats">
              <span><Cpu size={14} /> {worker.jobs_processed} processed</span>
              <span>{worker.jobs_failed} failed</span>
            </div>
            <small>Heartbeat {new Date(worker.last_heartbeat).toLocaleTimeString()}</small>
          </div>
        ))}
        {workers.length === 0 && <p className="empty">No worker heartbeats yet.</p>}
      </div>
    </section>
  );
}
