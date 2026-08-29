import { useEffect } from "react";

export function useKeyboardShortcuts({ onRefresh }) {
  useEffect(() => {
    function handleKeyDown(event) {
      const isControl = event.ctrlKey || event.metaKey;
      if (!isControl) return;

      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".search-box input, .toolbar input, .worker-search input")?.focus();
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        document.querySelector(".composer select")?.focus();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        onRefresh?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRefresh]);
}
