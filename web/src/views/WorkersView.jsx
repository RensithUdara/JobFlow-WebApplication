import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, RefreshCcw, Search, UsersRound, Wifi } from "lucide-react";

export function WorkersView({ stats, refresh, loading }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const workers = stats?.workers || [];

  const filteredWorkers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return workers.filter((worker) => {
      const matchesStatus = status === "all" || worker.status === status;
      const searchable = `${worker.hostname} ${worker.status}`.toLowerCase();
      return matchesStatus && (!cleanQuery || searchable.includes(cleanQuery));
    });
  }, [workers, query, status]);

  const online = workers.filter((worker) => worker.status === "online").length;
  const offline = workers.length - online;
  const avgHeartbeat = online > 0 ? "Live" : "N/A";

  return (
    <div className="workers-view">
      <div className="view-heading">
        <div>
          <h2>Worker Fleet</h2>
          <p>Manage and monitor your workers</p>
        </div>
        <button className="secondary refresh-button" onClick={refresh}>
          <RefreshCcw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <section className="worker-metrics">
        <WorkerMetric icon={UsersRound} label="Total Workers" value={workers.length} helper="Registered workers" tone="green" />
        <WorkerMetric icon={Wifi} label="Online" value={online} helper="Currently active" tone="green" />
        <WorkerMetric icon={Clock3} label="Offline" value={offline} helper="Not responding" tone="muted" />
        <WorkerMetric icon={Wifi} label="Heartbeat (avg)" value={avgHeartbeat} helper="Last 5 minutes" tone="blue" />
      </section>

      <section className="panel workers-table-panel">
        <div className="workers-table-header">
          <div className="title-inline">
            <UsersRound size={22} />
            <div>
              <h3>Workers</h3>
              <span>Worker heartbeat status</span>
            </div>
          </div>
          <div className="worker-controls">
            <div className="search-box worker-search">
              <Search size={17} />
              <input placeholder="Search workers..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="worker-table">
          <div className="worker-row head">
            <span><input type="checkbox" /></span>
            <span>Worker Name</span>
            <span>Status</span>
            <span>Current Job</span>
            <span>Queues</span>
            <span>Last Heartbeat</span>
            <span>Uptime</span>
            <span>Actions</span>
          </div>

          {filteredWorkers.map((worker) => (
            <div className="worker-row" key={worker.id}>
              <span><input type="checkbox" /></span>
              <strong>{worker.hostname || "Worker"}</strong>
              <span className={`worker-pill ${worker.status}`}>{worker.status}</span>
              <span>Idle</span>
              <span>default</span>
              <span>{new Date(worker.last_heartbeat).toLocaleString()}</span>
              <span>Active</span>
              <button className="icon-button small" title="Refresh"><RefreshCcw size={15} /></button>
            </div>
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="worker-empty-state">
            <div className="empty-orb"><UsersRound size={42} /></div>
            <h3>No worker heartbeats yet.</h3>
            <p>Your workers will appear here once they start and send heartbeat signals.</p>
            <button className="secondary refresh-button" onClick={refresh}>
              <RefreshCcw size={16} className={loading ? "spin" : ""} /> Refresh Now
            </button>
          </div>
        )}

        <div className="workers-footer">
          <strong>{filteredWorkers.length} workers</strong>
          <div>
            <button className="icon-button small" disabled><ChevronLeft size={16} /></button>
            <span>Page 1 of 1</span>
            <button className="icon-button small" disabled><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkerMetric({ icon: Icon, label, value, helper, tone }) {
  return (
    <div className={`worker-metric ${tone}`}>
      <div className="worker-metric-icon"><Icon size={25} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </div>
  );
}
