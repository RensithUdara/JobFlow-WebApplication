import React, { useEffect } from "react";
import { AlertTriangle, LogOut, RotateCcw, X } from "lucide-react";

const icons = {
  danger: AlertTriangle,
  warning: LogOut,
  info: RotateCcw,
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  busy = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const Icon = icons[variant] || AlertTriangle;

  return (
    <div className="confirm-overlay" role="presentation" onMouseDown={onCancel}>
      <section
        className={`confirm-dialog confirm-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button small confirm-close" type="button" onClick={onCancel} aria-label="Close confirmation">
          <X size={16} />
        </button>
        <div className="confirm-icon">
          <Icon size={24} />
        </div>
        <div className="confirm-copy">
          <h3 id="confirm-title">{title}</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button className="secondary" type="button" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={`primary ${variant === "danger" ? "danger-primary" : ""}`} type="button" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
