import React from "react";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { statusOptions } from "../data/jobTemplates.js";
import { StatusBadge } from "./StatusBadge.jsx";

export function JobTable({ jobs, selectedJob, onSelect, onRetry, onCancel, filters, onFiltersChange, onExport }) {
  return (
    <section className="panel table-panel">
      <div className="panel-title split">
        <div><h3>Jobs</h3><span>{jobs.length} visible</span></div>
        <button className="secondary" onClick={() => onExport(jobs)}><Download size={15} /> Export</button>
      </div>
      <div className="toolbar">
        <input placeholder="Search type, queue, status, id" value={filters.query} onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })} />
        <select value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}>
          {statusOptions.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={filters.queue} onChange={(event) => onFiltersChange({ ...filters, queue: event.target.value })}>
          <option>all</option><option>emails</option><option>images</option><option>webhooks</option><option>reports</option><option>default</option>
        </select>
      </div>
      <div className="job-table">
        <div className="row head"><span>Type</span><span>Queue</span><span>Status</span><span>Attempts</span><span></span></div>
        {jobs.map((job) => (
          <button className={`row ${selectedJob?.id === job.id ? "selected" : ""}`} key={job.id} onClick={() => onSelect(job)}>
            <span>{job.type}</span>
            <span>{job.queue}</span>
            <StatusBadge status={job.status} />
            <span>{job.attempts} / {job.max_attempts}</span>
            <span className="actions">
              <RotateCcw size={15} onClick={(event) => { event.stopPropagation(); onRetry(job); }} />
              <Trash2 size={15} onClick={(event) => { event.stopPropagation(); onCancel(job); }} />
            </span>
          </button>
        ))}
        {jobs.length === 0 && <p className="empty">No jobs match the current filters.</p>}
      </div>
    </section>
  );
}
