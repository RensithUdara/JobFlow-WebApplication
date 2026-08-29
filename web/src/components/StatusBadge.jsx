import React from "react";

export function StatusBadge({ status }) {
  return <span className={`status ${status}`}>{status}</span>;
}
