import React from "react";
import { Radio } from "lucide-react";

export function ActivityFeed({ events }) {
  return (
    <section className="panel activity-feed">
      <div className="panel-title"><Radio size={18} /><div><h3>Realtime Events</h3><span>Live queue activity</span></div></div>
      <div className="event-list">
        {events.map((event, index) => (
          <div className="event-row" key={`${event.event}-${index}`}>
            <span>{event.event}</span>
            <code>{event.data?.id || event.data?.type || "system"}</code>
          </div>
        ))}
        {events.length === 0 && <p className="empty">No realtime events received yet.</p>}
      </div>
    </section>
  );
}
