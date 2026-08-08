# AGENTS.md - Master AI Agent Directive & Operating Standard

Welcome to **DinePosAi** — an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system and point-of-sale platform designed for hospitality environments.

> [!IMPORTANT]
> This file is the authoritative rulebook and primary directive for all AI coding agents operating in this workspace. Read and follow all instructions strictly before inspecting, modifying, or testing code.

---

## 1. Project Purpose & Current State

DinePosAi is an enterprise multi-tenant restaurant management and POS platform unifying:
- **Cashier POS Terminal** ([apps/web/app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)): Speed-optimized order creation, split payments, table grid, cash drawer management, and ESC/POS thermal printing.
- **Kitchen Display System (KDS)** ([apps/web/app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx)): Real-time ticket queue, status transitions (`PENDING` -> `COOKING` -> `READY` -> `SERVED`), and audio alerts.
- **Digital Guest Menu & AI Concierge** ([apps/web/app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx)): Table QR digital menu browsing and interactive Google Gemini AI sommelier (Aura) recommendations.
- **Inventory & Recipe Costing** ([apps/api/src/controllers/inventory.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/inventory.controller.ts)): Ingredient stock levels, menu item recipes, waste/spoilage logs, and purchase orders.
- **Super Admin SaaS Operations** ([apps/web/app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)): Tenant onboarding, platform MRR telemetry, account status overrides, support ticketing, and system audit logs.

**Current Architecture State**: Fully operational monorepo with 21 PostgreSQL tables, Supabase Row-Level Security (RLS), Stripe subscription billing, Google Gemini AI integration, and direct ESC/POS hardware receipt encoding.

---

## 2. Technology Stack

- **Monorepo Engine**: `pnpm` workspaces (`apps/web`, `apps/api`, `packages/shared-types`). Do NOT use `npm` or `yarn`.
- **Language**: TypeScript (`^5.4.5`) across all packages and apps.
- **Frontend Framework**: Next.js 16 (`16.2.7` App Router), React 19 (`^19.0.0`), Tailwind CSS (`^3.4.1`), Lucide React icons.
- **Backend Framework**: Node.js (`>=18.x`), Express (`^4.19.2`), Zod schema validation (`^3.23.8`), Pino structured logger (`^8.17.2`).
- **Database & Auth**: Supabase PostgreSQL 15+ with Row-Level Security (RLS) policies and GoTrue auth.
- **Integrations**: Stripe Billing (`stripe ^15.7.0`), Google Gemini AI (`gemini-1.5-flash`), Resend Email Service, Sentry Error Tracking (`@sentry/node`, `@sentry/nextjs`), PostHog Analytics (`posthog-js`).
- **Detailed Reference**: Read [docs/tech-stack.md](file:///h:/Antigravity/DinePosAi/docs/tech-stack.md).

---

## 3. Architecture Overview

```
+------------------------------------------------------------------+
|                     apps/web (Next.js 16)                        |
+------------------------------------------------------------------+
        |                                          |
        | Shared Types                             | REST API Requests
        v                                          v
+------------------------------------+   +-------------------------+
| packages/shared-types (TS Schemas) |   |  apps/api (Express Node)|
+------------------------------------+   +-------------------------+
                                                   |
                                                   | Postgres Queries / RLS
                                                   v
                                         +-------------------------+
                                         | Supabase DB & Auth      |
                                         +-------------------------+
```

### Express Security & Request Pipeline
```
Incoming Request -> CORS Matching -> JSON Body (rawBody capture for webhooks) -> Security Headers -> Rate Limiter -> Pino Logger -> requireAuth -> validateOrganizationActive -> requireOrganizationMatch -> requirePermission -> Zod Validation -> Controller Handler -> auditLogger
```
- **Detailed Reference**: Read [docs/architecture.md](file:///h:/Antigravity/DinePosAi/docs/architecture.md).

---

## 4. Important Directories and Files

| File / Directory Path | Description & Role |
|-----------------------|--------------------|
| [packages/shared-types/src/index.ts](file:///h:/Antigravity/DinePosAi/packages/shared-types/src/index.ts) | Canonical source for all TypeScript domain models, enum constants, `PERMISSIONS` dictionary, and `ApiResponse<T>` envelope. |
| [apps/api/src/server.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/server.ts) | Express server entrypoint, environment check, CORS origins, rate limiters, route mounting, graceful shutdown handlers. |
| [apps/api/src/middleware/auth.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/auth.ts) | JWT authentication validator and session memory cache (`authCache` 5s TTL). |
| [apps/api/src/middleware/organization.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/organization.middleware.ts) | Multi-tenant isolation guard (`requireOrganizationMatch`). |
| [apps/api/src/middleware/permission.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/permission.middleware.ts) | Granular RBAC permission guard (`requirePermission`). |
| [apps/api/src/middleware/audit.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/audit.middleware.ts) | Automated post-response audit logger middleware (`auditLogger`). |
| [apps/web/app/authContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/authContext.tsx) | Global React authentication state context provider. |
| [apps/web/app/printerContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/printerContext.tsx) | Hardware thermal printer socket context provider. |
| [supabase/migrations/](file:///h:/Antigravity/DinePosAi/supabase/migrations) | PostgreSQL table DDL, RLS policies, indexes, and custom RPC functions. |
| **Detailed Reference**: Read [docs/ai-context/important-files.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/important-files.md).

---

## 5. Coding Conventions

- **File Naming**:
  - `kebab-case` for utility scripts, middleware, and route files (`order.routes.ts`, `organization.middleware.ts`).
  - `PascalCase.tsx` for React UI components (`CheckoutModal.tsx`, `ActiveOrdersList.tsx`).
  - `domain.controller.ts` for Express API controllers (`inventory.controller.ts`).
- **Unified API Response**: Every Express controller MUST return responses conforming to `ApiResponse<T>`:
  ```typescript
  // Success
  res.json({ success: true, data: result });
  // Error
  res.status(400).json({ success: false, error: 'Error message' });
  ```
- **UI Styling**: Tailwind CSS combined with dark glassmorphism utilities (`backdrop-blur-md bg-slate-900/80 border border-slate-800`) and custom HSL color tokens (`var(--primary)`, `var(--accent)`).
- **Detailed Reference**: Read [docs/ai-context/coding-rules.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/coding-rules.md).

---

## 6. Database Rules

- Table names MUST use `snake_case` plural nouns (`users`, `categories`, `menu_items`, `orders`, `inventory_items`, `audit_logs`).
- Primary keys MUST be UUIDs with `DEFAULT uuid_generate_v4()`.
- Every tenant table MUST include `tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`.
- Atomic multi-table updates (e.g. stock deduction on order fulfillment) MUST execute stored PostgreSQL functions (`increment_stock`, `decrement_stock`) via Supabase RPC calls.
- All database DDL alterations MUST be created as SQL files in `supabase/migrations/` and executed using `node scripts/deploy-migrations.js`.
- **Detailed Reference**: Read [docs/database.md](file:///h:/Antigravity/DinePosAi/docs/database.md).

---

## 7. API Conventions

- Base endpoint prefix: `/api/`
- Standard headers required: `Authorization: Bearer <token>`, `Content-Type: application/json`.
- Request validation: Validate all mutation request bodies using Zod schemas via `validateSchema(schema)` middleware.
- Audit logging: Attach `auditLogger(action, entityType)` middleware to successful mutation routes (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Detailed Reference**: Read [docs/api.md](file:///h:/Antigravity/DinePosAi/docs/api.md).

---

## 8. Authentication & Authorization Rules

- JWT tokens are signed with `JWT_SECRET` (HS256) and contain `{ id, tenantId, role, email, sessionId }`.
- Session state is verified against `user_sessions` and cached in Node process memory for 5 seconds (`authCache`).
- System Roles: `SUPER_ADMIN`, `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`.
- Granular permissions: 26 permission keys declared in `PERMISSIONS` ([packages/shared-types/src/index.ts](file:///h:/Antigravity/DinePosAi/packages/shared-types/src/index.ts)).
- The `SUPER_ADMIN` role bypasses all RBAC permission checks and tenant boundaries.
- **Detailed Reference**: Read [docs/authentication.md](file:///h:/Antigravity/DinePosAi/docs/authentication.md) and [docs/authorization.md](file:///h:/Antigravity/DinePosAi/docs/authorization.md).

---

## 9. Testing Requirements

- Verify TypeScript compilation across workspaces: `pnpm build`
- Run global package test suites: `pnpm test`
- Execute standalone API integration smoke tests:
  ```bash
  cd apps/api
  node test_health.js
  node test_login_api.js
  node check_db.js
  ```
- **Detailed Reference**: Read [docs/testing.md](file:///h:/Antigravity/DinePosAi/docs/testing.md).

---

## 10. Security Rules

1. **Never Hardcode Secrets**: Private keys, JWT secrets, database connection strings, and service role keys MUST be loaded from `process.env`.
2. **Mandatory Tenant Isolation**: Every tenant endpoint MUST invoke `requireOrganizationMatch` to prevent cross-tenant data leaks.
3. **Sensitive Field Redaction**: The audit logger middleware redacts sensitive fields (`password`, `token`, `refreshToken`, `currentPassword`) before persisting logs.
4. **Brute-Force Rate Limiting**: Authentication endpoints are protected by `authLimiter` (5 requests / 15 minutes in production).

---

## 11. Existing Patterns That Must Be Followed

- **Middleware Pipeline Pattern**: `requireAuth` -> `validateOrganizationActive` -> `requireOrganizationMatch` -> `requirePermission` -> `validateSchema` -> `auditLogger`.
- **Shared Types Import Pattern**: Always import entity interfaces and enums from `@dineposai/shared-types`.
- **Context Provider Tree Pattern**: React providers nested cleanly in [apps/web/app/layout.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/layout.tsx) (`PostHogProvider` -> `AuthProvider` -> `PrinterProvider`).

---

## 12. Files & Systems That Must NOT Be Changed Without Explicit Approval

> [!CAUTION]
> The following core items MUST NOT be altered without explicit user confirmation:
> 1. Database table schemas or column names in `supabase/migrations/`.
> 2. Shared type interfaces or enum values in `packages/shared-types/src/index.ts`.
> 3. The `requireOrganizationMatch` multi-tenant isolation security middleware in `organization.middleware.ts`.
> 4. The `rawBody` parser hook for Stripe webhook signature verification in `apps/api/src/server.ts`.
> 5. Existing test scripts or environment variable key names.

---

## 13. Known Technical Debt & Limitations

- `authCache` memory TTL is 5 seconds per Node server process.
- Direct TCP thermal printing (port 9100) requires local LAN network socket access or fallback to browser print dialogs.
- **Detailed Reference**: Read [docs/ai-context/known-limitations.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/known-limitations.md).

---

## 14. Documentation References

- [Master Documentation Index](file:///h:/Antigravity/DinePosAi/docs/README.md)
- [Project Overview](file:///h:/Antigravity/DinePosAi/docs/project-overview.md)
- [System Architecture](file:///h:/Antigravity/DinePosAi/docs/architecture.md)
- [Technology Stack](file:///h:/Antigravity/DinePosAi/docs/tech-stack.md)
- [Folder Structure](file:///h:/Antigravity/DinePosAi/docs/folder-structure.md)
- [Database Schema Reference](file:///h:/Antigravity/DinePosAi/docs/database.md)
- [Authentication Architecture](file:///h:/Antigravity/DinePosAi/docs/authentication.md)
- [Authorization & RBAC](file:///h:/Antigravity/DinePosAi/docs/authorization.md)
- [API Reference Manual](file:///h:/Antigravity/DinePosAi/docs/api.md)
- [Frontend Architecture](file:///h:/Antigravity/DinePosAi/docs/frontend.md)
- [Backend Engine](file:///h:/Antigravity/DinePosAi/docs/backend.md)
- [Third-Party Integrations](file:///h:/Antigravity/DinePosAi/docs/integrations.md)
- [Deployment Guide](file:///h:/Antigravity/DinePosAi/docs/deployment.md)
- [Environment Variables](file:///h:/Antigravity/DinePosAi/docs/environment-variables.md)
- [Testing & Quality Assurance](file:///h:/Antigravity/DinePosAi/docs/testing.md)
- [Troubleshooting & FAQs](file:///h:/Antigravity/DinePosAi/docs/troubleshooting.md)
- [Coding Rules & Standards](file:///h:/Antigravity/DinePosAi/docs/ai-context/coding-rules.md)
- [Important Files Map](file:///h:/Antigravity/DinePosAi/docs/ai-context/important-files.md)

---

## 15. Mandatory 7-Phase AI Development Workflow

All development tasks in this project MUST strictly follow this sequence:

`UNDERSTAND` -> `PLAN` -> `IMPLEMENT` -> `TEST` -> `REVIEW` -> `DOCUMENT` -> `REPORT`

### Phase 1 — UNDERSTAND
Before writing any code:
1. Read [AGENTS.md](file:///h:/Antigravity/DinePosAi/AGENTS.md).
2. Read the relevant documentation inside [docs/](file:///h:/Antigravity/DinePosAi/docs/README.md).
3. Inspect existing implementations related to the task.
4. Identify existing patterns, components, services, APIs, database models, and utilities to reuse.
5. Check whether the requested functionality already partially exists.
*Do not start coding immediately.*

### Phase 2 — PLAN
Before implementation, present a practical plan detailing:
- What needs to change
- Which files will likely change
- Which existing components/functions will be reused
- Database changes, if any
- API changes, if any
- Potential risks
- Testing approach
*If the requirement conflicts with architecture or is ambiguous, stop and ask the user before coding.*

### Phase 3 — IMPLEMENT
After plan approval:
- Implement the smallest safe change.
- Follow existing project patterns and conventions.
- Reuse existing code whenever appropriate.
- Do not introduce unnecessary dependencies or redesign unrelated components.
- Preserve existing functionality and strictly abide by security rules.

### Phase 4 — TEST
After implementation:
1. Run relevant unit / integration test suites (`pnpm test`, standalone API scripts).
2. Run type checks and build compilation (`pnpm build`).
3. Verify the affected functionality and check for regressions.
4. Fix any failures found during verification.
*Do not claim something works unless empirically checked.*

### Phase 5 — REVIEW
Self-review checklist:
- Does the implementation match the exact requirement?
- Is existing architecture followed without unnecessary complexity?
- Were unrelated behaviors preserved?
- Are error cases and security isolation guards in place?
- Are test cases sufficient?

### Phase 6 — DOCUMENT
If the change alters architecture, database schema, API signatures, auth rules, major features, or development conventions:
- Update relevant Markdown files in [docs/](file:///h:/Antigravity/DinePosAi/docs/README.md).
*(Skip documentation updates for trivial, non-knowledge-altering code tweaks).*

### Phase 7 — FINAL REPORT
Conclude every development task with this structured report:
- **Changed**: List key files modified and summary of changes.
- **Why**: Brief explanation of implementation rationale.
- **Tests**: Commands/checks executed and results.
- **Documentation**: Document files updated (if any).
- **Risks**: Open questions, limitations, or manual checks needed.
- **Git**: Suggested concise commit message.

---

## 16. Obsidian Documentation Workflow

Before implementing any significant feature, bug fix, refactor, architecture change, database change, authentication/authorization change, API change, or deployment change:

1. Read `docs/architecture.md` first.
2. Use its AI Development Guidance and Change Impact Map to identify affected subsystems.
3. Read all relevant documentation before modifying code.
4. For feature-specific work, read the corresponding document under `docs/features/`.
5. For architectural decisions, inspect relevant ADRs under `docs/decisions/`.
6. Use the Obsidian wikilinks in the documentation to discover related context.

During implementation:
- Treat the documentation as the current architectural source of truth.
- If implementation reveals that documented architecture or behavior is outdated, update the relevant documentation.
- Do not create documentation links to nonexistent files.

After implementation:
1. Verify that affected documentation remains accurate.
2. Update architecture/feature/ADR documentation when the change materially affects them.
3. Verify newly added wikilinks resolve to existing Markdown files.
4. Mention documentation changes in the final task report.

Do not commit or push unless explicitly instructed by the user.


