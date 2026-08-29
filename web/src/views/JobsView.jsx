import React from "react";
import { JobComposer } from "../components/JobComposer.jsx";
import { JobDetails } from "../components/JobDetails.jsx";
import { JobTable } from "../components/JobTable.jsx";
import { useJobFilters } from "./useJobFilters.js";

export function JobsView(props) {
  const { filteredJobs, allFilteredJobs, filters, setFilters, pageCount } = useJobFilters(props.jobs);

  return (
    <div className="jobs-layout">
      <JobComposer onCreate={props.createJobs} />
      <div className="content-grid">
        <JobTable
          jobs={filteredJobs}
          allJobs={allFilteredJobs}
          selectedJob={props.selectedJob}
          onSelect={props.setSelectedJob}
          onRetry={props.retryJob}
          onCancel={props.cancelJob}
          filters={filters}
          onFiltersChange={setFilters}
          onExport={props.exportJobs}
          pageCount={pageCount}
        />
        <JobDetails job={props.selectedJob || filteredJobs[0]} />
      </div>
    </div>
  );
}
