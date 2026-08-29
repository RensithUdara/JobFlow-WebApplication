# JobFlow Frontend Guide

The frontend is a React + Vite dashboard located in `web/`.

## Run The Dashboard

```bash
cd web
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build

```bash
cd web
npm run build
```

## Main Files

```text
web/src/
  App.jsx
  main.jsx
  styles.css
  api/client.js
  data/jobTemplates.js
  hooks/useJobFlow.js
  hooks/useJobDrafts.js
  hooks/useKeyboardShortcuts.js
  utils/format.js
```

## Views

| File | Purpose |
| --- | --- |
| `DashboardView.jsx` | Main operations dashboard |
| `JobsView.jsx` | Job management page |
| `QueuesView.jsx` | Queue monitor page |
| `WorkersView.jsx` | Worker fleet page |
| `SettingsView.jsx` | Theme, density, export, and refresh settings |

## Important Components

| File | Purpose |
| --- | --- |
| `AuthScreen.jsx` | Login and registration |
| `Sidebar.jsx` | Fixed left navigation |
| `BrandLogo.jsx` | Shared logo component |
| `JobComposer.jsx` | Job creation, templates, drafts, import |
| `JobTable.jsx` | Searchable/filterable job table |
| `JobDetails.jsx` | Selected job detail panel |
| `JobTimeline.jsx` | Job lifecycle timeline |
| `JobAnalytics.jsx` | Runtime and risk analytics |
| `ConfirmDialog.jsx` | Custom confirmation modal |
| `QueueBoard.jsx` | Queue depth cards |
| `WorkerBoard.jsx` | Worker overview cards |
| `ActivityFeed.jsx` | Realtime event feed |

## Theme System

Theme is stored in local storage:

```text
jobflow_theme
```

Supported values:

```text
light
dark
```

The selected theme becomes a class on the app shell:

```text
theme-light
theme-dark
```

## Density System

Density is stored in local storage:

```text
jobflow_density
```

Supported values:

```text
comfortable
compact
```

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` | Focus search |
| `Ctrl + N` | Focus create job |
| `Ctrl + R` | Refresh dashboard data |

