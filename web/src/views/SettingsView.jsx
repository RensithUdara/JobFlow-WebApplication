import React from "react";
import { Download, SlidersHorizontal } from "lucide-react";

export function SettingsView({ density, theme, onDensityChange, onThemeChange, stats, onExport }) {
  return (
    <section className="panel settings-panel">
      <div className="panel-title"><SlidersHorizontal size={18} /><h3>Console Settings</h3></div>
      <div className="settings-grid">
        <label>Density<select value={density} onChange={(event) => onDensityChange(event.target.value)}>
          <option value="comfortable">comfortable</option>
          <option value="compact">compact</option>
        </select></label>
        <label>Theme<select value={theme} onChange={(event) => onThemeChange(event.target.value)}>
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select></label>
        <label>API status<input value={`${stats?.total_jobs || 0} jobs indexed`} readOnly /></label>
      </div>
      <button className="primary" onClick={onExport}><Download size={16} /> Export all jobs</button>
    </section>
  );
}
