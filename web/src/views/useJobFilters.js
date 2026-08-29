import { useMemo, useState } from "react";

export function useJobFilters(jobs) {
  const [filters, setFilters] = useState({ query: "", status: "all", queue: "all" });

  const filteredJobs = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = filters.status === "all" || job.status === filters.status;
      const matchesQueue = filters.queue === "all" || job.queue === filters.queue;
      const searchable = `${job.id} ${job.type} ${job.queue} ${job.status}`.toLowerCase();
      return matchesStatus && matchesQueue && (!query || searchable.includes(query));
    });
  }, [jobs, filters]);

  return { filters, setFilters, filteredJobs };
}
