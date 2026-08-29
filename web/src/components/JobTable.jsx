import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw, Trash2 } from "lucide-react";
import { statusOptions } from "../data/jobTemplates.js";
import { StatusBadge } from "./StatusBadge.jsx";

export function JobTable({
  jobs,
  allJobs,
  selectedJob,
  onSelect,
  onRetry,
  onCancel,
  filters,
  onFiltersChange,
  onExport,
  pageCount,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const pageIds = useMemo(() => jobs.map((job) => job.id), [jobs]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  function toggleJob(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function togglePage() {
    setSelectedIds((current) => {
      if (allPageSelected) return current.filter((id) => !pageIds.includes(id));
      return [...new Set([...current, ...pageIds])];
    });
  }

  const selectedJobs = allJobs.filter((job) => selectedIds.includes(job.id));

  async function bulkRetry() {
    for (const job of selectedJobs) {
      await onRetry(job);
    }
    setSelectedIds([]);
  }

  async function bulkCancel() {
    for (const job of selectedJobs) {
      await onCancel(job);
    }
    setSelectedIds([]);
  }

  return (
    <section className="panel table-panel">
      <div className="panel-title split">
        <div><h3>Jobs</h3><span>{allJobs.length} matched</span></div>
        <div className="button-row">
          <button className="secondary" onClick={() => onExport(selectedJobs.length ? selectedJobs : allJobs)}><Download size={15} /> Export</button>
          <button className="secondary" disabled={!selectedJobs.length} onClick={bulkRetry}><RotateCcw size={15} /> Retry</button>
          <button className="secondary danger" disabled={!selectedJobs.length} onClick={bulkCancel}><Trash2 size={15} /> Cancel</button>
        </div>
      </div>
      <div className="toolbar">
        <input placeholder="Search type, queue, status, id" value={filters.query} onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })} />
        <select value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}>
          {statusOptions.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={filters.queue} onChange={(event) => onFiltersChange({ ...filters, queue: event.target.value })}>
          <option>all</option><option>emails</option><option>images</option><option>webhooks</option><option>reports</option><option>default</option>
        </select>
        <select value={filters.sort} onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value })}>
          <option value="created_desc">newest</option>
          <option value="priority_desc">priority</option>
          <option value="attempts_desc">attempts</option>
          <option value="status_asc">status</option>
        </select>
        <select value={filters.pageSize} onChange={(event) => onFiltersChange({ ...filters, pageSize: Number(event.target.value), page: 1 })}>
          <option value="10">10 rows</option>
          <option value="25">25 rows</option>
          <option value="50">50 rows</option>
        </select>
      </div>
      <div className="job-table">
        <div className="row head">
          <span><input type="checkbox" checked={allPageSelected} onChange={togglePage} /></span>
          <span>Type</span><span>Queue</span><span>Status</span><span>Priority</span><span>Attempts</span><span></span>
        </div>
        {jobs.map((job) => (
          <button className={`row ${selectedJob?.id === job.id ? "selected" : ""}`} key={job.id} onClick={() => onSelect(job)}>
            <span onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(job.id)} onChange={() => toggleJob(job.id)} /></span>
            <span>{job.type}</span>
            <span>{job.queue}</span>
            <StatusBadge status={job.status} />
            <span>{job.priority}</span>
            <span>{job.attempts} / {job.max_attempts}</span>
            <span className="actions">
              <RotateCcw size={15} onClick={(event) => { event.stopPropagation(); onRetry(job); }} />
              <Trash2 size={15} onClick={(event) => { event.stopPropagation(); onCancel(job); }} />
            </span>
          </button>
        ))}
        {jobs.length === 0 && <p className="empty">No jobs match the current filters.</p>}
      </div>
      <div className="pagination">
        <button className="icon-button small" disabled={filters.page <= 1} onClick={() => onFiltersChange({ ...filters, page: filters.page - 1 })}><ChevronLeft size={16} /></button>
        <span>Page {filters.page} of {pageCount}</span>
        <button className="icon-button small" disabled={filters.page >= pageCount} onClick={() => onFiltersChange({ ...filters, page: filters.page + 1 })}><ChevronRight size={16} /></button>
      </div>
    </section>
  );
}
