import React from "react";
import { Download, Plus, RefreshCcw, Search } from "lucide-react";

export function CommandBar({ filters, onFiltersChange, onRefresh, onExport, onFocusCreate, loading }) {
  return (
    <section className="command-bar">
      <div className="search-box">
        <Search size={17} />
        <input
          placeholder="Search jobs, queues, ids"
          value={filters.query}
          onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
        />
      </div>
      <button className="secondary" onClick={onFocusCreate}><Plus size={15} /> New job</button>
      <button className="secondary" onClick={onExport}><Download size={15} /> Export</button>
      <button className="icon-button" onClick={onRefresh} title="Refresh">
        <RefreshCcw size={18} className={loading ? "spin" : ""} />
      </button>
    </section>
  );
}
