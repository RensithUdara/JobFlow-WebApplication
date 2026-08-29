import React, { useMemo, useState } from "react";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Toast } from "./components/Toast.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { DashboardView } from "./views/DashboardView.jsx";
import { JobsView } from "./views/JobsView.jsx";
import { QueuesView } from "./views/QueuesView.jsx";
import { SettingsView } from "./views/SettingsView.jsx";
import { WorkersView } from "./views/WorkersView.jsx";
import { useJobFlow } from "./hooks/useJobFlow.js";

export function App() {
  const jobFlow = useJobFlow();
  const [activeView, setActiveView] = useState("dashboard");
  const [density, setDensity] = useState(localStorage.getItem("jobflow_density") || "comfortable");
  const [theme, setTheme] = useState(localStorage.getItem("jobflow_theme") || "light");

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
      <Sidebar activeView={activeView} onNavigate={setActiveView} onSignOut={jobFlow.signOut} />
      <section className="workspace">
        {!["workers", "settings"].includes(activeView) && (
          <Topbar title={viewTitle} user={jobFlow.user} loading={jobFlow.loading} onRefresh={jobFlow.refresh} />
        )}
        <Toast notice={jobFlow.notice} error={jobFlow.error} onClear={() => { jobFlow.setNotice(""); jobFlow.setError(""); }} />

        {activeView === "dashboard" && <DashboardView {...jobFlow} />}
        {activeView === "jobs" && <JobsView {...jobFlow} />}
        {activeView === "queues" && <QueuesView stats={jobFlow.stats} />}
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
    </main>
  );
}
