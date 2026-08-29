export const queueOptions = [
  { value: "emails", label: "Emails" },
  { value: "images", label: "Images" },
  { value: "webhooks", label: "Webhooks" },
  { value: "reports", label: "Reports" },
  { value: "default", label: "Default" },
];

export const jobTemplates = {
  send_email: {
    label: "Send Email",
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
    label: "Send Notification",
    queue: "default",
    priority: 6,
    payload: { recipient: "Rensith Udara", message: "Your report is ready" },
  },
  generate_report: {
    label: "Generate Report",
    queue: "reports",
    priority: 2,
    payload: { report: "monthly_revenue", format: "pdf", account: "Operations Team" },
  },
  send_webhook: {
    label: "Send Webhook",
    queue: "webhooks",
    priority: 8,
    payload: { url: "https://httpbin.org/post", body: { event: "jobflow.test" } },
  },
  process_data: {
    label: "Process Data",
    queue: "default",
    priority: 4,
    payload: { dataset: "imports/customers.csv", mode: "dedupe" },
  },
};

export const statusOptions = ["all", "queued", "running", "completed", "retrying", "failed", "dead_letter", "cancelled"];
