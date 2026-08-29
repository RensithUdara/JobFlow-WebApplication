import React, { useMemo, useState } from "react";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Toast } from "./components/Toast.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { DashboardView } from "./views/DashboardView.jsx";
import { JobsView } from "./views/JobsView.jsx";
import { QueuesView } from "./views/QueuesView.jsx";
import { SettingsView } from "./views/SettingsView.jsx";
import { WorkersView } from "./views/WorkersView.jsx";
import { useJobFlow } from "./hooks/useJobFlow.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";

export function App() {
  const jobFlow = useJobFlow();
  const [activeView, setActiveView] = useState("dashboard");
  const [density, setDensity] = useState(localStorage.getItem("jobflow_density") || "comfortable");
  const [theme, setTheme] = useState(localStorage.getItem("jobflow_theme") || "light");
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  useKeyboardShortcuts({ onRefresh: jobFlow.refresh });

  const viewTitle = useMemo(() => ({
    dashboard: "Operations Dashboard",
    jobs: "Job Control",
    queues: "Queue Monitor",
    workers: "Worker Fleet",
    settings: "Settings",
  })[activeView], [activeView]);

  function changeDensity(nextDensity) {
    localStorage.setItem("jobflow_density", nextDensity);
    setDensity(nextDensity);
  }

  function changeTheme(nextTheme) {
    localStorage.setItem("jobflow_theme", nextTheme);
    setTheme(nextTheme);
  }

  function requestConfirm(options) {
    setConfirm(options);
  }

  function closeConfirm() {
    if (confirmBusy) return;
    setConfirm(null);
  }

  async function runConfirmAction() {
    if (!confirm?.onConfirm) return;
    setConfirmBusy(true);
    try {
      await confirm.onConfirm();
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  function confirmSignOut() {
    requestConfirm({
      title: "Sign out?",
      message: "Your current session will close on this device. You can sign in again anytime.",
      confirmLabel: "Sign out",
      variant: "warning",
      onConfirm: jobFlow.signOut,
    });
  }

  if (!jobFlow.authed) {
    return (
      <AuthScreen
        onAuth={jobFlow.authenticate}
        notice={jobFlow.notice}
        error={jobFlow.error}
        setNotice={jobFlow.setNotice}
        setError={jobFlow.setError}
      />
    );
  }

  return (
    <main className={`app-shell density-${density} theme-${theme}`}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} onSignOut={confirmSignOut} />
      <section className="workspace">
        {!["queues", "workers", "settings"].includes(activeView) && (
          <Topbar title={viewTitle} user={jobFlow.user} loading={jobFlow.loading} onRefresh={jobFlow.refresh} />
        )}
        <Toast notice={jobFlow.notice} error={jobFlow.error} onClear={() => { jobFlow.setNotice(""); jobFlow.setError(""); }} />

        {activeView === "dashboard" && <DashboardView {...jobFlow} requestConfirm={requestConfirm} />}
        {activeView === "jobs" && <JobsView {...jobFlow} requestConfirm={requestConfirm} />}
        {activeView === "queues" && <QueuesView {...jobFlow} />}
        {activeView === "workers" && <WorkersView {...jobFlow} />}
        {activeView === "settings" && (
          <SettingsView
            density={density}
            theme={theme}
            onDensityChange={changeDensity}
            onThemeChange={changeTheme}
            stats={jobFlow.stats}
            onExport={() => jobFlow.exportJobs()}
            onRefresh={jobFlow.refresh}
            loading={jobFlow.loading}
          />
        )}
      </section>
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        cancelLabel={confirm?.cancelLabel}
        variant={confirm?.variant}
        busy={confirmBusy}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
    </main>
  );
}
