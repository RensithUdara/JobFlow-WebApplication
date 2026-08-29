import React, { useMemo, useState } from "react";
import { ClipboardList, Plus, Send } from "lucide-react";
import { jobTemplates, queueOptions } from "../data/jobTemplates.js";

export function JobComposer({ onCreate }) {
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

  function chooseTemplate(nextType) {
    const template = jobTemplates[nextType];
    setType(nextType);
    setQueue(template.queue);
    setPriority(template.priority);
    setPayloadText(JSON.stringify(template.payload, null, 2));
    setJsonError("");
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
        <Plus size={18} />
        <h3>Create Job</h3>
      </div>
      <div className="template-grid">
        {types.map((item) => (
          <button key={item} className={item === type ? "selected" : ""} onClick={() => chooseTemplate(item)} type="button">
            <ClipboardList size={15} /> {jobTemplates[item].label}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Type<select value={type} onChange={(event) => chooseTemplate(event.target.value)}>
            {types.map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <label>Queue<select value={queue} onChange={(event) => setQueue(event.target.value)}>
            {queueOptions.map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <label>Priority <span>{priority}</span><input type="range" min="0" max="10" value={priority} onChange={(event) => setPriority(event.target.value)} /></label>
          <label>Max attempts<input type="number" min="1" max="10" value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} /></label>
          <label>Batch count<input type="number" min="1" max="25" value={batchCount} onChange={(event) => setBatchCount(event.target.value)} /></label>
          <label>Schedule<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={forceFail} onChange={(event) => setForceFail(event.target.checked)} /> Force retry path</label>
        </div>
        <label className="payload-editor">Payload JSON<textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} /></label>
        {jsonError && <div className="inline-error">{jsonError}</div>}
        <button className="primary"><Send size={16} /> Enqueue</button>
      </form>
    </section>
  );
}
