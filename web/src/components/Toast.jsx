import React from "react";
import { X } from "lucide-react";

export function Toast({ notice, error, onClear }) {
  if (!notice && !error) return null;
  return (
    <div className={`toast ${error ? "error" : ""}`}>
      <span>{error || notice}</span>
      <button className="icon-button small" onClick={onClear} title="Dismiss"><X size={15} /></button>
    </div>
  );
}
