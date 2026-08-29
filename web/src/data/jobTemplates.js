export const queueOptions = ["emails", "images", "webhooks", "reports", "default"];

export const jobTemplates = {
  send_email: {
    label: "Email",
    queue: "emails",
    priority: 5,
    payload: { to: "user@example.com", subject: "Welcome", body: "Hello from JobFlow" },
  },
  resize_image: {
    label: "Image Resize",
    queue: "images",
    priority: 3,
    payload: { image_url: "https://example.com/image.jpg", width: 800, height: 600 },
  },
  send_notification: {
    label: "Notification",
    queue: "default",
    priority: 6,
    payload: { user_id: "usr_123", message: "Your report is ready" },
  },
  generate_report: {
    label: "Report",
    queue: "reports",
    priority: 2,
    payload: { report: "monthly_revenue", format: "pdf", account_id: "acct_001" },
  },
  send_webhook: {
    label: "Webhook",
    queue: "webhooks",
    priority: 8,
    payload: { url: "https://httpbin.org/post", body: { event: "jobflow.test" } },
  },
  process_data: {
    label: "Data Process",
    queue: "default",
    priority: 4,
    payload: { dataset: "imports/customers.csv", mode: "dedupe" },
  },
};

export const statusOptions = ["all", "queued", "running", "completed", "retrying", "failed", "dead_letter", "cancelled"];
