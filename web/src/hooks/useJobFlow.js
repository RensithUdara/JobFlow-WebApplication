import { useEffect, useMemo, useState } from "react";
import { API_URL, api, downloadJson } from "../api/client.js";

const tokenKey = "jobflow_token";

export function useJobFlow() {
  const [token, setToken] = useState(localStorage.getItem(tokenKey) || "");
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const authed = Boolean(token);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const [jobData, statsData] = await Promise.all([
        api("/api/jobs?limit=100", {}, token),
        api("/api/dashboard", {}, token),
      ]);
      setJobs(jobData);
      setStats(statsData);
      setSelectedJob((current) => {
        if (!current) return jobData[0] || null;
        return jobData.find((job) => job.id === current.id) || jobData[0] || null;
      });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function authenticate(mode, credentials) {
    const data = await api(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem(tokenKey, data.token);
    setToken(data.token);
    setUser(data.user);
    setNotice(mode === "register" ? "Account created" : "Signed in");
  }

  function signOut() {
    localStorage.removeItem(tokenKey);
    setToken("");
    setUser(null);
    setJobs([]);
    setStats(null);
    setSelectedJob(null);
  }

  async function createJobs(form) {
    const payloadBase = form.forceFail ? { ...form.payload, force_fail: true } : form.payload;
    const count = Math.max(1, Number(form.batchCount) || 1);
    const created = [];
    for (let index = 0; index < count; index += 1) {
      const payload = count === 1 ? payloadBase : { ...payloadBase, batch_index: index + 1 };
      const body = {
        queue: form.queue,
        type: form.type,
        priority: Number(form.priority),
        max_attempts: Number(form.maxAttempts),
        payload,
      };
      if (form.scheduledAt) body.scheduled_at = new Date(form.scheduledAt).toISOString();
      created.push(await api("/api/jobs", { method: "POST", body: JSON.stringify(body) }, token));
    }
    setNotice(count === 1 ? `Queued ${created[0].type}` : `Queued ${created.length} jobs`);
    await refresh();
  }

  async function retryJob(job) {
    await api(`/api/jobs/${job.id}/retry`, { method: "POST" }, token);
    setNotice("Job requeued");
    await refresh();
  }

  async function cancelJob(job) {
    await api(`/api/jobs/${job.id}/cancel`, { method: "DELETE" }, token);
    setNotice("Job cancelled");
    await refresh();
  }

  function exportJobs(scope = jobs) {
    downloadJson(`jobflow-jobs-${new Date().toISOString().slice(0, 10)}.json`, scope);
    setNotice("Export downloaded");
  }

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const source = new EventSource(`${API_URL}/api/events`);
    source.onmessage = (message) => {
      const parsed = JSON.parse(message.data);
      setEvents((current) => [parsed, ...current].slice(0, 30));
      refresh();
    };
    source.onerror = () => setError("Realtime connection interrupted");
    return () => source.close();
  }, [token]);

  const health = useMemo(() => {
    const total = stats?.total_jobs || 0;
    const completed = stats?.completed || 0;
    const failed = (stats?.failed || 0) + (stats?.dead_letter || 0);
    return {
      successRate: total ? Math.round((completed / total) * 100) : 0,
      failureRate: total ? Math.round((failed / total) * 100) : 0,
      activeWorkers: stats?.workers?.filter((worker) => worker.status === "online").length || 0,
    };
  }, [stats]);

  return {
    authed,
    user,
    jobs,
    stats,
    health,
    selectedJob,
    notice,
    error,
    events,
    loading,
    setNotice,
    setError,
    setSelectedJob,
    authenticate,
    signOut,
    refresh,
    createJobs,
    retryJob,
    cancelJob,
    exportJobs,
  };
}
