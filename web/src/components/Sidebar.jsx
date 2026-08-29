import React from "react";
import { Activity, BriefcaseBusiness, CheckCircle2, LogOut, RadioTower, Settings, Workflow } from "lucide-react";
import { BrandLogo } from "./BrandLogo.jsx";

const items = [
  ["dashboard", "Dashboard", Activity],
  ["jobs", "Jobs", BriefcaseBusiness],
  ["queues", "Queues", Workflow],
  ["workers", "Workers", RadioTower],
  ["settings", "Settings", Settings],
];

export function Sidebar({ activeView, onNavigate, onSignOut }) {
  return (
    <aside className="sidebar">
      <BrandLogo />
      <nav>
        {items.map(([key, label, Icon]) => (
          <button key={key} className={activeView === key ? "active" : ""} onClick={() => onNavigate(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <div className="system-card">
        <div><CheckCircle2 size={16} /><strong>System Online</strong></div>
        <span>All services operational</span>
      </div>
      <button className="ghost wide" onClick={onSignOut}><LogOut size={16} /> Sign out</button>
    </aside>
  );
}
