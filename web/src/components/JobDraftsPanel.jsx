import React from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { jobTemplates } from "../data/jobTemplates.js";
import { titleize } from "../utils/format.js";

export function JobDraftsPanel({ drafts, onLoad, onDelete, onClear }) {
  return (
    <section className="draft-panel">
      <div className="draft-panel-head">
        <div>
          <strong>Saved Drafts</strong>
          <span>{drafts.length ? `${drafts.length} ready to load` : "No saved drafts yet"}</span>
        </div>
        <button className="secondary small-text" type="button" disabled={!drafts.length} onClick={onClear}>Clear</button>
      </div>
      <div className="draft-list">
        {drafts.map((draft) => (
          <div className="draft-row" key={draft.draftId}>
            <button type="button" onClick={() => onLoad(draft)}>
              <FolderOpen size={15} />
              <span>
                <strong>{jobTemplates[draft.type]?.label || titleize(draft.type)}</strong>
                <small>{draft.queue} queue | priority {draft.priority}</small>
              </span>
            </button>
            <button className="icon-button small" type="button" onClick={() => onDelete(draft.draftId)} aria-label="Delete draft">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
