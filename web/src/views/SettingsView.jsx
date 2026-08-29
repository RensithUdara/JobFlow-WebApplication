import React from "react";
import { Download, RefreshCcw, Settings } from "lucide-react";

export function SettingsView({ density, theme, onDensityChange, onThemeChange, stats, onExport, onRefresh, loading }) {
  return (
    <div className="settings-view">
      <div className="view-heading">
        <div>
          <h2>Settings</h2>
          <p>Configure your console preferences</p>
        </div>
        <button className="icon-button settings-refresh" onClick={onRefresh} title="Refresh">
          <RefreshCcw size={20} className={loading ? "spin" : ""} />
        </button>
      </div>

      <section className="panel settings-panel">
        <div className="settings-title">
          <div className="settings-icon"><Settings size={26} /></div>
          <div>
            <h3>Console Settings</h3>
            <span>Customize how your queue console works</span>
          </div>
        </div>

        <div className="settings-grid">
          <label>
            <strong>Density</strong>
            <span>Adjust the spacing of elements in the console</span>
            <select value={density} onChange={(event) => onDensityChange(event.target.value)}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label>
            <strong>Theme</strong>
            <span>Choose the appearance of the console</span>
            <select value={theme} onChange={(event) => onThemeChange(event.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="api-status-field">
            <strong>API Status</strong>
            <span>Information about the current API state</span>
            <input value={`${stats?.total_jobs || 0} jobs indexed`} readOnly />
          </label>
        </div>

        <div className="settings-actions">
          <button className="primary" onClick={onExport}><Download size={17} /> Export all jobs</button>
          <button className="secondary refresh-button" onClick={onRefresh}>
            <RefreshCcw size={17} className={loading ? "spin" : ""} /> Refresh status
          </button>
        </div>
      </section>
    </div>
  );
}
