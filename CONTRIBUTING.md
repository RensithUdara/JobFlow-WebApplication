# Contributing To JobFlow

Thanks for improving JobFlow.

## Development Workflow

1. Create a branch.
2. Make a focused change.
3. Run backend tests.
4. Build the frontend.
5. Open a pull request or commit your changes.

## Commands

Backend:

```bash
go test ./...
```

Frontend:

```bash
cd web
npm run build
```

## Code Style

- Keep Go code formatted with `gofmt`.
- Keep React components small and readable.
- Prefer existing component and CSS patterns.
- Keep UI text human-readable.
- Do not show raw internal IDs in the UI unless explicitly needed.
- Keep environment secrets out of git.

## Commit Style

Use short, clear commit messages:

```text
Add worker analytics panel
Fix dark theme select colors
Update job composer drafts
```

## Pull Request Checklist

- Backend tests pass
- Frontend build passes
- New UI works in light and dark themes
- New environment variables are documented
- README or docs are updated when behavior changes

