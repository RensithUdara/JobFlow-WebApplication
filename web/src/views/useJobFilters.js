import { useMemo, useState } from "react";

export function useJobFilters(jobs) {
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    queue: "all",
    sort: "created_desc",
    pageSize: 10,
    page: 1,
  });

  const sortedJobs = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const filtered = jobs.filter((job) => {
      const matchesStatus = filters.status === "all" || job.status === filters.status;
      const matchesQueue = filters.queue === "all" || job.queue === filters.queue;
      const searchable = `${job.id} ${job.type} ${job.queue} ${job.status}`.toLowerCase();
      return matchesStatus && matchesQueue && (!query || searchable.includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (filters.sort === "priority_desc") return b.priority - a.priority;
      if (filters.sort === "attempts_desc") return b.attempts - a.attempts;
      if (filters.sort === "status_asc") return a.status.localeCompare(b.status);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [jobs, filters]);

  const pageCount = Math.max(1, Math.ceil(sortedJobs.length / Number(filters.pageSize)));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * Number(filters.pageSize);
  const filteredJobs = sortedJobs.slice(start, start + Number(filters.pageSize));

  function updateFilters(nextFilters) {
    setFilters({ ...nextFilters, page: nextFilters.page || 1 });
  }

  return { filters: { ...filters, page }, setFilters: updateFilters, filteredJobs, allFilteredJobs: sortedJobs, pageCount };
}
