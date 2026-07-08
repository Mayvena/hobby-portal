# Implementation Plan

## Phase 0: Repository Preparation

- Treat `backend` as an independent project root.
- Initialize a Node.js + TypeScript service with Fastify.
- Add linting, formatting, test, and Prisma scripts.
- Add Dockerfile and local Docker Compose for PostgreSQL.

Deliverable:

- backend project boots locally and exposes `/health`

## Phase 1: Database Foundation

- Create Prisma schema for users, roles, pages, role-page access, and refresh tokens.
- Create first migration.
- Add seed/import script for the current frontend dummy data.

Deliverable:

- `prisma migrate dev` and seed/import produce a working initial database

## Phase 2: Auth And Session Layer

- Implement login, logout, refresh, and current-user endpoints.
- Hash stored passwords.
- Add refresh token rotation and revocation.
- Add auth plugin or middleware for protected routes.

Deliverable:

- frontend can authenticate against the backend without relying on local session state

## Phase 3: RBAC And Core Admin Data

- Implement users endpoints.
- Implement roles endpoints.
- Implement pages and role-page access endpoints.
- Add server-side authorization checks based on page access.

Deliverable:

- current admin and page-access workflows have backend equivalents

## Phase 4: Domain Module Migration

Migrate modules one at a time in this order:

1. calendar
2. library
3. finances
4. assets

For each module:

- define Prisma models
- add service layer
- add route handlers
- add validation schemas
- add permission checks
- update frontend `DataBroker` methods to call backend endpoints

Deliverable:

- domain data is no longer stored in browser local storage

## Phase 5: Hardening

- Add audit logging for sensitive operations.
- Add request logging and correlation IDs.
- Add rate limiting for auth endpoints.
- Add integration tests for auth and RBAC.
- Add backup and restore guidance.

Deliverable:

- backend is safe to deploy beyond a local development environment

## Frontend Migration Tactic

Keep the frontend `DataBroker` class as the compatibility layer during migration.

Approach:

- preserve existing method names where practical
- replace local storage implementations with fetch-based calls internally
- migrate module by module instead of rewriting the whole frontend in one change

This reduces the blast radius and keeps UI code changes smaller.

## Recommended First Build Slice

The first actual implementation pass should include:

1. scaffold backend service
2. add Prisma and PostgreSQL setup
3. define access-control schema
4. implement auth endpoints
5. implement users and roles endpoints
6. seed from current dummy data

That slice creates the most leverage because it converts the current app's identity and permission model into a real server-side authority.

## Acceptance Criteria For V1

- backend starts with one command
- migrations run non-interactively in CI and production
- login and session refresh work end-to-end
- protected routes reject unauthorized users server-side
- users, roles, pages, and page access persist in PostgreSQL
- at least one domain module is fully migrated off browser storage