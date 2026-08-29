import React from "react";
import { QueueBoard } from "../components/QueueBoard.jsx";
import { TypeChart } from "../components/TypeChart.jsx";

export function QueuesView({ stats }) {
  return (
    <div className="main-grid">
      <QueueBoard stats={stats} />
      <TypeChart stats={stats} />
    </div>
  );
}
