import React from "react";
import { CalendarClock, Square } from "lucide-react";
import { JobTimeline } from "./JobTimeline.jsx";
import { StatusBadge } from "./StatusBadge.jsx";
import { jobDisplayName, payloadDisplayValue, queueDisplayName } from "../utils/format.js";

export function JobDetails({ job }) {
  if (!job) {
    return <section className="panel detail-panel"><p className="empty">No jobs yet.</p></section>;
  }

  const duration = job.started_at && job.completed_at
    ? `${((new Date(job.completed_at) - new Date(job.started_at)) / 1000).toFixed(2)}s`
    : "Pending";
  const jobName = jobDisplayName(job);
  const payload = payloadDisplayValue(job.payload);

  return (
    <section className="panel detail-panel">
      <div className="panel-title split">
        <div><h3>Job Details</h3><span>{jobName}</span></div>
      </div>
      <div className="detail-summary">
        <div><Square size={16} /><StatusBadge status={job.status} /></div>
        <div><CalendarClock size={16} /><span>{duration}</span></div>
      </div>
      <dl>
        <dt>Name</dt><dd>{jobName}</dd>
        <dt>Queue</dt><dd>{queueDisplayName(job.queue)}</dd>
        <dt>Priority</dt><dd>{job.priority}</dd>
        <dt>Attempts</dt><dd>{job.attempts} / {job.max_attempts}</dd>
        <dt>Created</dt><dd>{new Date(job.created_at).toLocaleString()}</dd>
        <dt>Started</dt><dd>{job.started_at ? new Date(job.started_at).toLocaleString() : "Not started"}</dd>
        <dt>Completed</dt><dd>{job.completed_at ? new Date(job.completed_at).toLocaleString() : "Not completed"}</dd>
        <dt>Error</dt><dd>{job.error_message || "None"}</dd>
      </dl>
      <JobTimeline job={job} />
      <pre className="payload">{JSON.stringify(payload, null, 2)}</pre>
    </section>
  );
}
