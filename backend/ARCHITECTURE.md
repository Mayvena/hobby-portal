# Backend Architecture

## Architectural Style

Use a modular monolith.

That means:

- one deployable backend service
- one primary PostgreSQL database
- internal modules with explicit boundaries
- shared operational concerns handled once

This is the best fit for the current project size because the frontend already behaves as one coherent application with shared user, role, and page metadata.

## Stack Decisions

### Runtime And Framework

- Node.js 22 LTS
- TypeScript
- Fastify

Fastify is the preferred choice here because it stays simple in deployment, has a clean plugin model, and works well with typed request schemas.

### Persistence

- PostgreSQL
- Prisma ORM and migrations

Reasons:

- user, role, page, and asset data are relational by nature
- migrations need to be explicit and portable
- Postgres is broadly supported across local, cloud, and containerized environments

### Validation And Contracts

- Zod for request and domain validation
- OpenAPI generation from route schemas

This keeps request validation close to the endpoint logic and makes it easier to expose a stable contract to the frontend.

### Authentication And Sessions

- short-lived JWT access tokens
- refresh tokens stored server-side and rotated on refresh
- hashed passwords using `argon2`

The current frontend-only username/password flow should not be copied directly. Passwords should be stored only as hashes in the database, and refresh token rotation should make session invalidation practical.

### Observability

- Pino JSON logging
- request ID per request
- health endpoint and readiness endpoint
- optional Sentry or equivalent later

## Module Boundaries

### Auth

Responsibilities:

- login
- logout
- token refresh
- current-session lookup
- password hash verification
- refresh token invalidation

### Users

Responsibilities:

- user CRUD
- profile updates
- user lookup by id and username

### Roles

Responsibilities:

- role definitions
- user-role assignments

### Permissions

Responsibilities:

- page definitions
- role-to-page mappings
- effective access checks

The frontend currently mixes role and page access rules inside `DataBroker`. The backend should make that logic authoritative.

### Domain Modules

- `calendar`
- `library`
- `finances`
- `assets`

Each domain module owns its tables, service logic, and route handlers, but reuses auth, permissions, logging, and error handling.

### Audit

Responsibilities:

- immutable event records for sensitive changes
- actor, action, target, and timestamp capture
- support for admin troubleshooting

Audit logging should cover at least login/logout, role changes, page access changes, user mutations, finance mutations, and asset sale operations.

## Data Model

The initial schema should include the following tables.

### Identity And Access

- `users`
- `roles`
- `user_roles`
- `pages`
- `role_page_access`
- `refresh_tokens`

### Domain Data

- `calendar_events`
- `library_documents`
- `finances_config`
- `transactions`
- `asset_categories`
- `assets`

### Operations

- `audit_events`

## Proposed Entity Notes

### users

- UUID primary key
- unique username
- unique email where available
- password hash
- active flag
- timestamps

### roles

- string or UUID key
- unique label/id
- description

### user_roles

- composite unique key on user and role
- foreign keys with cascade rules appropriate for cleanup

### pages

- page id aligned to frontend page ids where practical
- label
- sort order

### role_page_access

- composite unique key on role and page
- backend rule remains: no mapping means page is open unless product policy changes

If that open-by-default rule is retained, document it clearly in code and tests because it has security implications.

## Authorization Model

Use server-side RBAC middleware built on the existing project concepts.

Rules:

- frontend visibility checks are only a convenience
- backend authorization is mandatory for every protected route
- permissions should be evaluated from the authenticated user plus assigned roles
- admin override should be explicit, limited, and tested

Route handlers should declare required access in one place rather than embedding scattered checks.

## API Design

Use REST endpoints under `/api/v1`.

Examples:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:userId`
- `DELETE /api/v1/users/:userId`
- `GET /api/v1/roles`
- `PUT /api/v1/roles/:roleId/page-access`
- `GET /api/v1/calendar/events`
- `POST /api/v1/assets`

Principles:

- keep route naming boring and predictable
- validate requests before handler execution
- centralize error translation to HTTP responses
- return stable DTOs instead of leaking ORM entities directly

## Code Layout

Recommended layout:

```text
backend/
  src/
    app.ts
    server.ts
    env.ts
    plugins/
      auth.ts
      prisma.ts
      security.ts
    modules/
      auth/
      users/
      roles/
      permissions/
      calendar/
      library/
      finances/
      assets/
      audit/
    shared/
      http/
      errors/
      security/
      types/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
  Dockerfile
  docker-compose.yml
```

## Environment Model

Minimum environment variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `CORS_ORIGIN`

Do not commit secrets. Provide a `.env.example` once the backend scaffold is created.

## Deployment Model

### Local

- Docker Compose for PostgreSQL
- backend process started with a dev script
- Prisma migrations applied locally

### Production

- one application container
- managed PostgreSQL
- startup sequence runs `prisma migrate deploy`
- readiness probe waits for database connectivity

This supports simple platforms such as Render, Fly.io, Azure App Service with container deployment, or a small Kubernetes setup if needed later.

## Reliability Practices

- graceful shutdown hooks
- typed configuration loading
- request timeouts
- rate limiting on auth endpoints
- structured logs
- DB connection pooling
- test coverage on auth and permission logic before domain expansion

## Security Baseline

- `argon2` password hashing
- HttpOnly refresh token cookie if browser deployment allows it
- CSRF strategy chosen explicitly if cookies are used
- strict CORS configuration
- no trust in frontend access checks
- audit sensitive admin actions

## Migration From Current Frontend State

The frontend currently persists everything in `src/dataBroker.ts` through browser storage seeded from `src/data/dummy.json`.

The migration path should be:

1. Import dummy data into Postgres through a seed/import script.
2. Introduce backend auth and session endpoints.
3. Replace `DataBroker` session methods with HTTP-backed methods.
4. Move users, roles, pages, and permissions next.
5. Migrate domain modules after access control is authoritative on the server.

This keeps the frontend surface stable while moving the source of truth to the backend.