# AGENTS.md

This file defines working guidance for agents making changes in this backend project.

## Scope

- Apply these instructions to files under `relib/backend`.
- Treat this folder as the backend project root for installs, builds, tests, and file edits.
- Do not apply these rules to the frontend app in `relib/relib` unless the task explicitly spans both projects.

## Project Intent

- Build a modular monolith backend.
- Use Fastify + TypeScript + PostgreSQL + Prisma.
- Prefer deployment simplicity over early distributed architecture.
- Keep the backend as the source of truth for auth, roles, page access, and business data.

## Working Rules

- Keep changes narrow and aligned to the current module being implemented.
- Prefer boring, predictable architecture over abstractions introduced ahead of need.
- Put authorization rules in backend services or route guards, not in controllers alone and never in the frontend only.
- Use Prisma migrations for schema changes; do not rely on manual database drift.
- Keep API contracts explicit with schemas and typed DTOs.
- Avoid leaking raw Prisma models directly through HTTP responses when a stable response shape is better.

## Backend Structure Guidance

- Keep entrypoint and process wiring in top-level app/server files.
- Put business logic in module services, not route handlers.
- Keep module-local schemas, routes, and services together.
- Put shared HTTP, error, auth, and validation helpers in a small shared layer.
- Add new infrastructure only when the current operational model cannot support the need.

## Security Guidance

- Never store plain-text passwords.
- Use `argon2` for password hashing unless the project explicitly standardizes on something else.
- Enforce authorization server-side for every protected route.
- Rate-limit auth endpoints.
- Treat admin override behavior as explicit and testable logic.
- Avoid open CORS policies outside local development.

## Database Guidance

- Prefer UUID primary keys for new domain entities unless a stable string key already exists for compatibility.
- Keep many-to-many relations explicit and name them clearly.
- Write migrations that are deterministic and safe to apply in CI.
- Add indexes for lookup columns used in auth, permissions, and list queries.
- Seed data should be idempotent where possible.

## Testing Guidance

- Add focused tests around auth, permissions, and any non-trivial mutation logic.
- Prefer integration-style tests for route + DB behavior on core modules.
- Validate the narrowest relevant command before finishing: tests, lint, typecheck, or build.

## Deployment Guidance

- Assume one service container and one PostgreSQL database unless the task requires otherwise.
- Keep startup compatible with `prisma migrate deploy` in production.
- Preserve twelve-factor style configuration via environment variables.

## Agent Checklist

- Confirm the edit belongs in `relib/backend`.
- Check whether the change belongs to an existing module before creating a new shared abstraction.
- If the schema changes, update Prisma and the migration path together.
- If auth or authorization changes, add or update tests.
- Run at least one relevant validation command before finishing.