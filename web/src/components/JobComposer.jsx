import React, { useMemo, useRef, useState } from "react";
import { ClipboardList, FileUp, Plus, Save, Send } from "lucide-react";
import { jobTemplates, queueOptions } from "../data/jobTemplates.js";
import { JobDraftsPanel } from "./JobDraftsPanel.jsx";
import { useJobDrafts } from "../hooks/useJobDrafts.js";

export function JobComposer({ onCreate }) {
  const fileInputRef = useRef(null);
  const { drafts, saveDraft, deleteDraft, clearDrafts } = useJobDrafts();
  const [type, setType] = useState("send_email");
  const [queue, setQueue] = useState(jobTemplates.send_email.queue);
  const [priority, setPriority] = useState(jobTemplates.send_email.priority);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [forceFail, setForceFail] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [batchCount, setBatchCount] = useState(1);
  const [payloadText, setPayloadText] = useState(JSON.stringify(jobTemplates.send_email.payload, null, 2));
  const [jsonError, setJsonError] = useState("");

  const types = useMemo(() => Object.keys(jobTemplates), []);

  function currentDraft() {
    return {
      type,
      queue,
      priority,
      maxAttempts,
      forceFail,
      scheduledAt,
      batchCount,
      payloadText,
    };
  }

  function chooseTemplate(nextType) {
    const template = jobTemplates[nextType];
    setType(nextType);
    setQueue(template.queue);
    setPriority(template.priority);
    setPayloadText(JSON.stringify(template.payload, null, 2));
    setJsonError("");
  }

  function loadDraft(draft) {
    setType(draft.type);
    setQueue(draft.queue);
    setPriority(draft.priority);
    setMaxAttempts(draft.maxAttempts);
    setForceFail(Boolean(draft.forceFail));
    setScheduledAt(draft.scheduledAt || "");
    setBatchCount(draft.batchCount || 1);
    setPayloadText(draft.payloadText || "{}");
    setJsonError("");
  }

  function handleSaveDraft() {
    try {
      JSON.parse(payloadText || "{}");
      saveDraft(currentDraft());
      setJsonError("");
    } catch (err) {
      setJsonError(err.message);
    }
  }

  async function importJobFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const job = Array.isArray(data) ? data[0] : data;
      const nextType = job.type && jobTemplates[job.type] ? job.type : type;
      const template = jobTemplates[nextType];

      setType(nextType);
      setQueue(job.queue || template.queue);
      setPriority(job.priority ?? template.priority);
      setMaxAttempts(job.max_attempts || job.maxAttempts || maxAttempts);
      setBatchCount(job.batchCount || 1);
      setScheduledAt(job.scheduled_at ? job.scheduled_at.slice(0, 16) : "");
      setForceFail(Boolean(job.payload?.force_fail));
      setPayloadText(JSON.stringify(job.payload || job, null, 2));
      setJsonError("");
    } catch (err) {
      setJsonError(err.message);
    } finally {
      event.target.value = "";
    }
  }

  async function submit(event) {
    event.preventDefault();
    let payload;
    try {
      payload = JSON.parse(payloadText || "{}");
    } catch (err) {
      setJsonError(err.message);
      return;
    }
    setJsonError("");
    await onCreate({ type, queue, priority, maxAttempts, forceFail, scheduledAt, batchCount, payload });
  }

  return (
    <section className="panel composer">
      <div className="panel-title">
        <div className="title-icon"><Plus size={18} /></div>
        <div>
          <h3>Create Job</h3>
          <span>Add a new job to the queue</span>
        </div>
      </div>
      <div className="template-grid">
        {types.map((item) => (
          <button key={item} className={item === type ? "selected" : ""} onClick={() => chooseTemplate(item)} type="button">
            <ClipboardList size={15} /> {jobTemplates[item].label}
          </button>
        ))}
      </div>
      <div className="composer-actions">
        <button className="secondary" type="button" onClick={handleSaveDraft}><Save size={15} /> Save draft</button>
        <button className="secondary" type="button" onClick={() => fileInputRef.current?.click()}><FileUp size={15} /> Import JSON</button>
        <input ref={fileInputRef} className="hidden-file" type="file" accept="application/json,.json" onChange={importJobFile} />
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Type<select value={type} onChange={(event) => chooseTemplate(event.target.value)}>
            {types.map((item) => <option key={item} value={item}>{jobTemplates[item].label}</option>)}
          </select></label>
          <label>Queue<select value={queue} onChange={(event) => setQueue(event.target.value)}>
            {queueOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select></label>
          <label>Priority <span>{priority}</span><input type="range" min="0" max="10" value={priority} onChange={(event) => setPriority(event.target.value)} /></label>
          <label>Max attempts<input type="number" min="1" max="10" value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} /></label>
          <label>Batch count<input type="number" min="1" max="25" value={batchCount} onChange={(event) => setBatchCount(event.target.value)} /></label>
          <label>Schedule<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={forceFail} onChange={(event) => setForceFail(event.target.checked)} /> Force retry path</label>
        </div>
        <label className="payload-editor">Payload JSON<textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} /></label>
        {jsonError && <div className="inline-error">{jsonError}</div>}
        <button className="primary submit-right"><Send size={16} /> Enqueue Job</button>
      </form>
      <JobDraftsPanel drafts={drafts} onLoad={loadDraft} onDelete={deleteDraft} onClear={clearDrafts} />
    </section>
  );
}
