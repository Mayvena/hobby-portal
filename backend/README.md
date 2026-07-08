# Backend Plan

This directory will host the backend for the `relib` project.

The target backend architecture is intentionally conservative:

- Node.js 22 LTS runtime
- Fastify with TypeScript
- PostgreSQL as the system of record
- Prisma for schema management and migrations
- JWT access tokens with refresh token rotation
- Zod-backed request and response validation
- Pino JSON logging
- Docker-based local and production packaging

## Goals

- Straightforward deployment to a single container platform
- Predictable database migrations and safe rollbacks
- Clear path from current frontend `DataBroker` + `localStorage` persistence to server-backed APIs
- Good operational defaults without introducing unnecessary infrastructure

## Why This Shape

- A modular monolith is easier to deploy and debug than early microservices.
- PostgreSQL is stable, widely supported, and a good fit for relational access control data.
- Prisma keeps the schema, generated types, and migrations aligned.
- Fastify provides strong performance, typed route ergonomics, and simple plugin boundaries.

## Planned Modules

- `auth`
- `users`
- `roles`
- `permissions`
- `calendar`
- `library`
- `finances`
- `assets`
- `audit`

## Planned Document Set

- [ARCHITECTURE.md](./ARCHITECTURE.md): runtime, modules, data model, security, and deployment decisions
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md): phased delivery and migration plan from the current frontend-only model
- [AGENTS.md](./AGENTS.md): working instructions for agents editing this backend
- [copilot-instructions.md](./copilot-instructions.md): backend-specific coding guidance for future Copilot sessions

## Initial Delivery Scope

The first implementation milestone should produce:

1. Backend project scaffold in this directory
2. Prisma schema and first migration
3. Auth foundation with login, refresh, logout, and current-user endpoints
4. RBAC model for users, roles, pages, and page access
5. Seed/import path for the existing frontend dummy data

## Frontend Integration Strategy

The current frontend should keep its `DataBroker` API surface and swap the storage implementation gradually:

1. Replace local reads and writes with HTTP calls behind the same methods.
2. Move authentication and session refresh first.
3. Move RBAC and user management second.
4. Migrate domain modules one at a time after auth and permissions are stable.

## Deployment Summary

- Local development: backend process + Dockerized PostgreSQL
- Production: one Fastify container + managed PostgreSQL
- CI/CD: install, lint, test, build, `prisma migrate deploy`, deploy application

## Non-Goals For The First Version

- Microservices
- Event buses or message brokers
- Multi-database topology
- GraphQL
- Distributed caching

Those can be revisited later if measured usage or organizational needs justify added complexity.

## Current Implementation Status

The backend scaffold is now implemented with:

- Fastify server bootstrap and plugin wiring
- Prisma schema for users, roles, pages, rights, and refresh tokens
- Auth endpoints: login, refresh, logout, and current-user
- RBAC-aware users, roles, and page-role access endpoints
- Health and readiness endpoints
- Seed script that imports data from the existing frontend dummy dataset

## Implemented Routes

- `GET /health`
- `GET /ready`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:uid`
- `DELETE /api/v1/users/:uid`
- `PUT /api/v1/users/:uid/roles`
- `GET /api/v1/roles`
- `POST /api/v1/roles`
- `PATCH /api/v1/roles/:id`
- `DELETE /api/v1/roles/:id`
- `GET /api/v1/pages`
- `GET /api/v1/permissions/can-access`
- `GET /api/v1/permissions/role-page-access`
- `PUT /api/v1/permissions/pages/:pageId/roles`

## Local Run Steps

1. Copy `.env.example` to `.env` and update secrets.
2. Start PostgreSQL:
	- `docker compose up -d`
3. Generate Prisma client:
	- `npm run prisma:generate`
4. Apply migrations (when migration files are added):
	- `npm run prisma:migrate`
5. Seed data:
	- `npm run prisma:seed`
6. Start backend:
	- `npm run dev`

## Validation Commands

- `npm run build`
- `npm run typecheck`
- `npm run lint`