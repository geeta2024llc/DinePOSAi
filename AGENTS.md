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

## 15. Required Workflow Before Making Code Changes

Before proposing or executing any code edits, an AI coding agent MUST perform the following steps:

1. **Read AGENTS.md & Target Documentation**: Review this file and the corresponding subsystem guide in `docs/`.
2. **Inspect Existing Implementation**: Use `view_file` to read target source files and verify existing patterns. Do not guess file locations or signature types.
3. **Check Security & Multi-Tenancy**: Confirm whether the proposed change affects `tenant_id` filtering, authentication headers, or role permissions.
4. **Identify Established Pattern**: Ensure your solution follows established project conventions (e.g. Zod validation, `ApiResponse<T>`, HSL glassmorphism tokens). Do not invent new architectural patterns when one already exists.
5. **Formulate & Present Plan**: Present a clear execution plan to the user detailing target files and verification steps.

---

## 16. Required Workflow After Making Code Changes

After performing any code edits, an AI coding agent MUST follow this completion checklist:

1. **Make Smallest Safe Change**: Keep modifications focused strictly on the requested task. Do not touch unrelated files or refactor surrounding code.
2. **Run Verification Commands**: Execute TypeScript build checks and unit/integration tests:
   ```bash
   pnpm build
   pnpm test
   ```
3. **Verify API & Contract Consistency**: Ensure modified API endpoints conform to `ApiResponse<T>` and match `@dineposai/shared-types`.
4. **Update Markdown Documentation**: If architecture, route signatures, or database behavior changed, update the relevant file inside `docs/`.
5. **Provide Completion Report**: Present a concise report summarizing:
   - Modified files and specific changes.
   - Verification tests executed and results.
   - Any remaining risks, open questions, or manual verification steps.
