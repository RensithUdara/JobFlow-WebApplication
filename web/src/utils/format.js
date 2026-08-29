export function titleize(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function queueDisplayName(queue) {
  return titleize(queue || "default");
}

export function jobDisplayName(job) {
  const payload = job?.payload && typeof job.payload === "object" ? job.payload : {};
  return payload.name || payload.subject || titleize(job?.type || "Job");
}

export function payloadDisplayValue(value) {
  if (Array.isArray(value)) {
    return value.map(payloadDisplayValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const isIdentifier = key === "id" || key.endsWith("_id") || key.endsWith("Id");
        const displayKey = key === "id"
          ? "name"
          : key.replace(/_id$/, "").replace(/Id$/, "Name");

        return [displayKey, isIdentifier ? "Name unavailable" : payloadDisplayValue(item)];
      }),
    );
  }

  return value;
}
