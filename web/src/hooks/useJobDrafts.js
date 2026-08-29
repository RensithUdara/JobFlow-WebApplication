import { useEffect, useState } from "react";

const draftKey = "jobflow_job_drafts";

function readDrafts() {
  try {
    return JSON.parse(localStorage.getItem(draftKey) || "[]");
  } catch {
    return [];
  }
}

export function useJobDrafts() {
  const [drafts, setDrafts] = useState(readDrafts);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(drafts));
  }, [drafts]);

  function saveDraft(draft) {
    const nextDraft = {
      ...draft,
      draftId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    setDrafts((current) => [nextDraft, ...current].slice(0, 8));
    return nextDraft;
  }

  function deleteDraft(draftId) {
    setDrafts((current) => current.filter((draft) => draft.draftId !== draftId));
  }

  function clearDrafts() {
    setDrafts([]);
  }

  return { drafts, saveDraft, deleteDraft, clearDrafts };
}
