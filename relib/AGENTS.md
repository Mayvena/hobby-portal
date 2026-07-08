# AGENTS.md

This file defines working guidance for agents making changes in this project.

## Scope

- Apply these instructions to the Vite app in `relib/relib`.
- Treat this folder as the project root for installs, builds, linting, and file edits.

## Project Snapshot

- Stack: Vite 8, React 19, JavaScript/JSX with some TypeScript/TSX files.
- Entry points: `src/main.jsx` and `src/App.jsx`.
- Shared UI lives in `src/components`.
- Page-level views live in `src/pages`.
- Data access and local persistence live in `src/dataBroker.ts`.
- Seed data lives in `src/data/dummy.json`.

## Working Rules

- Keep changes small and focused on the requested behavior.
- Reuse existing components before adding new UI primitives.
- Preserve current naming and file layout unless the task requires a structural change.
- Do not access `localStorage` directly from React components when the same behavior belongs in `DataBroker`.
- Keep page metadata, role access, session state, and persisted app data flowing through `DataBroker` instead of duplicating storage logic in the UI.

## React Frontend Best Practices

- Prefer function components with clear props and minimal hidden coupling.
- Keep state close to where it is used, but avoid duplicating the same source of truth across sibling components.
- Derive state when possible instead of storing redundant copies.
- Use lazy `useState` initializers for expensive or persisted reads, such as session restoration.
- Keep side effects in `useEffect` and always clean up subscriptions, timers, and listeners.
- Favor controlled form inputs and explicit submit handlers.
- Keep presentational components in `src/components` and page orchestration in `src/pages`.
- When adding dashboard content, register new page renderers through `src/pages/dashboardPageRegistry.tsx` instead of expanding conditional render chains.
- Lift reusable data mutation and persistence logic into `DataBroker` instead of embedding it in components.
- Prefer composition over prop drilling when a small wrapper component can isolate behavior cleanly.
- Avoid premature optimization. Do not add `useMemo` or `useCallback` by default unless measurement or an existing local pattern justifies it.
- Use semantic HTML and accessible interactions: labels for fields, buttons for actions, and keyboard-safe modal behavior.

## Styling Guidance

- Follow the existing CSS and component structure before introducing a new styling approach.
- Keep class names descriptive and aligned with the surrounding file.
- Avoid large visual rewrites when the task is functional.
- For layout-heavy pages, favor maintainable structures over wide tables that break on smaller screens.

## Data And Access Patterns

- `dummy.json` is the source seed for users, roles, page metadata, rights, and calendar data.
- User rights and role access already have dedicated structures; extend those structures instead of inventing parallel ones.
- Session creation, refresh, save, and destroy behavior should remain centralized in `DataBroker`.

## Validation

- Install dependencies from the project root with `npm install`.
- Start local development with `npm run dev`.
- Validate production output with `npm run build`.
- Run `npm run lint` for JavaScript and JSX changes. The current ESLint config is focused on `*.js` and `*.jsx` files.

## Agent Checklist

- Confirm the edit is being made under `relib/relib`.
- Check whether an existing component, page, or `DataBroker` method already covers part of the requested behavior.
- Update the narrowest owning file first.
- Run at least one relevant validation command before finishing.