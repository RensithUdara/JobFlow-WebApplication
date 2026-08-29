import React from "react";
import { ActivityFeed } from "../components/ActivityFeed.jsx";
import { JobComposer } from "../components/JobComposer.jsx";
import { JobDetails } from "../components/JobDetails.jsx";
import { JobTable } from "../components/JobTable.jsx";
import { QueueBoard } from "../components/QueueBoard.jsx";
import { StatsStrip } from "../components/StatsStrip.jsx";
import { TypeChart } from "../components/TypeChart.jsx";
import { WorkerBoard } from "../components/WorkerBoard.jsx";
import { useJobFilters } from "./useJobFilters.js";

export function DashboardView(props) {
  const { filteredJobs, filters, setFilters } = useJobFilters(props.jobs);

  return (
    <>
      <StatsStrip stats={props.stats} health={props.health} />
      <div className="main-grid">
        <JobComposer onCreate={props.createJobs} />
        <div className="stack">
          <QueueBoard stats={props.stats} />
          <TypeChart stats={props.stats} />
        </div>
      </div>
      <div className="content-grid">
        <JobTable
          jobs={filteredJobs}
          selectedJob={props.selectedJob}
          onSelect={props.setSelectedJob}
          onRetry={props.retryJob}
          onCancel={props.cancelJob}
          filters={filters}
          onFiltersChange={setFilters}
          onExport={props.exportJobs}
        />
        <div className="stack">
          <JobDetails job={props.selectedJob || filteredJobs[0]} />
          <WorkerBoard stats={props.stats} />
          <ActivityFeed events={props.events} />
        </div>
      </div>
    </>
  );
}
