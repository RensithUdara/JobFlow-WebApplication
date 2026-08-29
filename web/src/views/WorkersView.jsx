import React from "react";
import { WorkerBoard } from "../components/WorkerBoard.jsx";

export function WorkersView({ stats }) {
  return <WorkerBoard stats={stats} />;
}
