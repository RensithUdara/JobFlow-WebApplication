import React from "react";
import { CheckCircle2, Clock, Play, RotateCcw, XCircle } from "lucide-react";

export function JobTimeline({ job }) {
  if (!job) return null;

  const steps = [
    { key: "created", label: "Created", time: job.created_at, icon: Clock, done: true },
    { key: "started", label: "Started", time: job.started_at, icon: Play, done: Boolean(job.started_at) },
    {
      key: "finished",
      label: job.status === "dead_letter" || job.status === "failed" ? "Failed" : "Completed",
      time: job.completed_at,
      icon: job.status === "dead_letter" || job.status === "failed" ? XCircle : CheckCircle2,
      done: Boolean(job.completed_at) || ["failed", "dead_letter", "completed"].includes(job.status),
    },
    { key: "retry", label: "Retry", time: null, icon: RotateCcw, done: job.status === "retrying" },
  ];

  return (
    <div className="timeline">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div className={`timeline-step ${step.done ? "done" : ""}`} key={step.key}>
            <span><Icon size={15} /></span>
            <div>
              <strong>{step.label}</strong>
              <small>{step.time ? new Date(step.time).toLocaleString() : "Waiting"}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
