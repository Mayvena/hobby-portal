# Backend Copilot Instructions

Use this directory when the task is about the `relib` backend service.

## Default Architecture Assumptions

- runtime: Node.js 22 LTS
- framework: Fastify
- language: TypeScript
- database: PostgreSQL
- ORM and migrations: Prisma
- auth: JWT access token plus rotated refresh token

## Coding Expectations

- Favor small modules with explicit boundaries.
- Keep request validation close to routes.
- Keep business rules in services.
- Keep route handlers thin.
- Avoid premature abstractions and dependency injection layers that do not pay for themselves yet.

## Data And Auth Expectations

- The backend, not the frontend, is authoritative for users, roles, page access, and session state.
- Passwords must be hashed.
- Authorization must be enforced server-side.
- Use migrations for every schema change.

## Migration Expectations

- The frontend currently uses `DataBroker` and browser storage.
- Backend work should support a gradual replacement of those methods with HTTP-backed implementations.
- Preserve current page ids and role semantics where practical to reduce migration friction.

## Operational Expectations

- Prefer container-friendly setup.
- Use structured logs.
- Keep environment configuration explicit and typed.
- Design for simple CI/CD with non-interactive migration execution.

## Documentation Expectations

- Keep [README.md](./README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) aligned when architecture decisions materially change.