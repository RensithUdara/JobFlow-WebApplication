import React from "react";
import { Gauge, ShieldCheck, TriangleAlert, UsersRound } from "lucide-react";

export function HealthPanel({ stats, health }) {
  const waiting = (stats?.queues || []).reduce((sum, queue) => sum + queue.waiting, 0);
  const risk = health.failureRate > 25 || waiting > 100 ? "attention" : "healthy";
  const Icon = risk === "healthy" ? ShieldCheck : TriangleAlert;

  return (
    <section className={`health-panel ${risk}`}>
      <div>
        <Icon size={22} />
        <span>{risk === "healthy" ? "Healthy" : "Attention"}</span>
      </div>
      <div className="health-grid">
        <span><Gauge size={15} /> {health.successRate}% success</span>
        <span><TriangleAlert size={15} /> {health.failureRate}% failures</span>
        <span><UsersRound size={15} /> {health.activeWorkers} workers</span>
      </div>
    </section>
  );
}
