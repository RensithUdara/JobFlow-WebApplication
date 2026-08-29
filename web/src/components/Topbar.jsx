import React from "react";
import { RefreshCcw } from "lucide-react";

export function Topbar({ title, user, loading, onRefresh }) {
  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>{user?.name || user?.email || "Signed in session"} | {new Date().toLocaleDateString()}</p>
      </div>
      <button className="icon-button" onClick={onRefresh} title="Refresh">
        <RefreshCcw size={18} className={loading ? "spin" : ""} />
      </button>
    </header>
  );
}
