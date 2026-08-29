import React from "react";
import { CalendarClock, Copy, Square } from "lucide-react";
import { JobTimeline } from "./JobTimeline.jsx";
import { StatusBadge } from "./StatusBadge.jsx";

export function JobDetails({ job }) {
  if (!job) {
    return <section className="panel detail-panel"><p className="empty">No jobs yet.</p></section>;
  }

  const duration = job.started_at && job.completed_at
    ? `${((new Date(job.completed_at) - new Date(job.started_at)) / 1000).toFixed(2)}s`
    : "Pending";

  async function copyId() {
    await navigator.clipboard.writeText(job.id);
  }

  return (
    <section className="panel detail-panel">
      <div className="panel-title split">
        <div><h3>Job Details</h3><span>{job.type}</span></div>
        <button className="icon-button small" onClick={copyId} title="Copy job id"><Copy size={15} /></button>
      </div>
      <div className="detail-summary">
        <div><Square size={16} /><StatusBadge status={job.status} /></div>
        <div><CalendarClock size={16} /><span>{duration}</span></div>
      </div>
      <dl>
        <dt>ID</dt><dd>{job.id}</dd>
        <dt>Queue</dt><dd>{job.queue}</dd>
        <dt>Priority</dt><dd>{job.priority}</dd>
        <dt>Attempts</dt><dd>{job.attempts} / {job.max_attempts}</dd>
        <dt>Created</dt><dd>{new Date(job.created_at).toLocaleString()}</dd>
        <dt>Started</dt><dd>{job.started_at ? new Date(job.started_at).toLocaleString() : "Not started"}</dd>
        <dt>Completed</dt><dd>{job.completed_at ? new Date(job.completed_at).toLocaleString() : "Not completed"}</dd>
        <dt>Error</dt><dd>{job.error_message || "None"}</dd>
      </dl>
      <JobTimeline job={job} />
      <pre className="payload">{JSON.stringify(job.payload, null, 2)}</pre>
    </section>
  );
}
