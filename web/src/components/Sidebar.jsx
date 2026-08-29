import React from "react";
import { Activity, BriefcaseBusiness, Clock, LogOut, RadioTower, Settings, Workflow } from "lucide-react";

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
      <div className="brand">
        <div className="brand-mark"><Clock size={20} /></div>
        <div>
          <h1>JobFlow</h1>
          <span>Queue operations console</span>
        </div>
      </div>
      <nav>
        {items.map(([key, label, Icon]) => (
          <button key={key} className={activeView === key ? "active" : ""} onClick={() => onNavigate(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <button className="ghost wide" onClick={onSignOut}><LogOut size={16} /> Sign out</button>
    </aside>
  );
}
