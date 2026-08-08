# AGENTS.md - Primary Directive for AI Coding Agents

Welcome to **DinePosAi** — an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system and point-of-sale platform designed for hospitality environments.

> [!IMPORTANT]
> This file is the primary entry point and rulebook for all AI coding agents operating in this codebase. Read this document thoroughly before inspecting or editing code.

---

## 1. Project Overview

DinePosAi is a multi-tenant SaaS platform built for restaurants, cafes, bars, and hospitality venues. It integrates:
- **Cashier POS Terminal** ([apps/web/app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)) — Quick checkout, table management, split checks, and thermal receipt printing.
- **Kitchen Display System (KDS)** ([apps/web/app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx)) — Real-time ticket tracking, preparation status transitions, and audio alerts.
- **Digital Guest Menu & AI Concierge** ([apps/web/app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx)) — Table QR scanning, food ordering, and Google Gemini AI sommelier recommendations.
- **Inventory & Recipe Costing** ([apps/api/src/controllers/inventory.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/inventory.controller.ts)) — Raw ingredient stock tracking, recipe formulas, waste logging, and purchase orders.
- **SaaS Platform Super Admin** ([apps/web/app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)) — Tenant onboarding, global MRR metrics, support ticketing, and account suspension.

---

## 2. Technology Stack

- **Monorepo**: pnpm workspaces (`apps/web`, `apps/api`, `packages/shared-types`).
- **Language**: TypeScript (`^5.4.5`) across all packages.
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React icons.
- **Backend**: Node.js, Express (`^4.19.2`), Zod schema validation, Pino logging.
- **Database & Auth**: Supabase PostgreSQL 15+ with Row-Level Security (RLS) policies.
- **Integrations**: Stripe Billing (`stripe ^15.7.0`), Google Gemini AI REST API, Resend Email Service, Sentry error tracking, PostHog analytics.
- **Detailed Reference**: Read [docs/tech-stack.md](file:///h:/Antigravity/DinePosAi/docs/tech-stack.md).

---

## 3. Architecture Summary

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
- **Detailed Reference**: Read [docs/architecture.md](file:///h:/Antigravity/DinePosAi/docs/architecture.md).

---

## 4. Important Project Rules

1. **Use pnpm Monorepo Tooling**: Always use `pnpm` (`pnpm dev`, `pnpm build`, `pnpm test`). Do NOT use `npm` or `yarn`.
2. **Never Hardcode Secrets**: Secrets must be loaded via `process.env`. Never commit hardcoded private keys or service tokens.
3. **Preserve Shared Types**: Import types from `@dineposai/shared-types`. Never re-declare database schemas or entity models locally.
4. **Strict Tenant Isolation**: All database operations MUST include `tenant_id` filtering. API routes MUST include `requireOrganizationMatch` middleware.
5. **No Blind Code Deletions**: Do not delete existing utility functions, test scripts, or docstrings without explicit instruction.

---

## 5. Coding Conventions

- **File Naming**: `kebab-case` for utility scripts and routes; `PascalCase.tsx` for React UI components; `domain.controller.ts` for Express controllers.
- **API Response Format**: Every Express endpoint MUST return a JSON object conforming to `ApiResponse<T>`:
  ```json
  { "success": true, "data": { ... }, "error": "Optional error string" }
  ```
- **CSS Styling**: Custom HSL color tokens (`var(--primary)`, `var(--accent)`) combined with Tailwind CSS glassmorphism classes (`backdrop-blur-md bg-slate-900/80`).
- **Detailed Reference**: Read [docs/ai-context/coding-rules.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/coding-rules.md).

---

## 6. Important Directories and Files

| File / Folder Path | Description |
|--------------------|-------------|
| [packages/shared-types/src/index.ts](file:///h:/Antigravity/DinePosAi/packages/shared-types/src/index.ts) | Canonical source for all TypeScript interfaces, enum types, and permissions. |
| [apps/api/src/server.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/server.ts) | Express API entrypoint, rate limiters, CORS, and signal handlers. |
| [apps/api/src/middleware/auth.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/auth.ts) | JWT authentication & session memory cache middleware (`requireAuth`). |
| [apps/api/src/middleware/organization.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/organization.middleware.ts) | Multi-tenant isolation guard (`requireOrganizationMatch`). |
| [apps/api/src/middleware/permission.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/permission.middleware.ts) | Granular RBAC permission guard (`requirePermission`). |
| [apps/web/app/authContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/authContext.tsx) | Global React authentication context provider. |
| [supabase/migrations/](file:///h:/Antigravity/DinePosAi/supabase/migrations) | PostgreSQL schema DDL, RLS policies, indexes, and custom RPC functions. |
| **Detailed Reference**: Read [docs/ai-context/important-files.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/important-files.md).

---

## 7. Database Conventions

- All table names use `snake_case` plural nouns (`users`, `categories`, `menu_items`, `orders`, `inventory_items`).
- Primary keys are UUIDs with `DEFAULT uuid_generate_v4()`.
- Every tenant table MUST have `tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`.
- Atomic multi-row mutations execute stored RPC functions (`increment_stock`, `decrement_stock`).
- **Detailed Reference**: Read [docs/database.md](file:///h:/Antigravity/DinePosAi/docs/database.md).

---

## 8. Authentication & Authorization Rules

- JWT tokens are signed with `JWT_SECRET` (HS256) and store `{ id, tenantId, role, email, sessionId }`.
- Sessions are statefully verified against `user_sessions` and cached in memory for 5 seconds (`authCache`).
- System roles: `SUPER_ADMIN`, `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`.
- `SUPER_ADMIN` role bypasses all RBAC permission checks and tenant boundaries.
- **Detailed Reference**: Read [docs/authentication.md](file:///h:/Antigravity/DinePosAi/docs/authentication.md) and [docs/authorization.md](file:///h:/Antigravity/DinePosAi/docs/authorization.md).

---

## 9. API Conventions

- Base path: `/api/`
- Standard headers: `Authorization: Bearer <token>`, `Content-Type: application/json`.
- Validation: Request bodies are validated using Zod schemas (`validateSchema(schema)`).
- Audit Logging: Successful mutation routes invoke post-response audit middleware (`auditLogger(action, entityType)`).
- **Detailed Reference**: Read [docs/api.md](file:///h:/Antigravity/DinePosAi/docs/api.md).

---

## 10. Testing Requirements

- Verify compilation and TypeScript types: `pnpm build`
- Execute full test suite: `pnpm test`
- Integration smoke tests in `apps/api`: `node test_health.js`, `node test_login_api.js`, `node check_db.js`.
- **Detailed Reference**: Read [docs/testing.md](file:///h:/Antigravity/DinePosAi/docs/testing.md).

---

## 11. Non-Negotiable Rules (Things AI MUST NOT Change)

> [!CAUTION]
> The following items MUST NOT be altered without explicit user confirmation:
> 1. Database table schemas or column names in `supabase/migrations`.
> 2. Shared type interfaces in `packages/shared-types`.
> 3. The `requireOrganizationMatch` tenant isolation security middleware.
> 4. The raw body parser hook for Stripe webhook signature verification in `server.ts`.
> 5. Existing test scripts or environment variable key names.

---

## 12. Important Dependencies

- `@dineposai/shared-types` — Internal monorepo workspace package.
- `express-rate-limit` — Rate limiting middleware.
- `pino` & `pino-http` — Server logger.
- `stripe` — Subscription billing & webhook handler.
- `@supabase/supabase-js` — Database client.
- `@sentry/node` & `@sentry/nextjs` — Error monitoring.

---

## 13. Known Limitations & Technical Debt

- `authCache` memory TTL is 5 seconds per Node process.
- Direct TCP thermal printing port 9100 requires network access or browser print dialog fallback.
- **Detailed Reference**: Read [docs/ai-context/known-limitations.md](file:///h:/Antigravity/DinePosAi/docs/ai-context/known-limitations.md).

---

## 14. Documentation Suite Quick Links

- [Documentation Index](file:///h:/Antigravity/DinePosAi/docs/README.md)
- [Project Overview](file:///h:/Antigravity/DinePosAi/docs/project-overview.md)
- [System Architecture](file:///h:/Antigravity/DinePosAi/docs/architecture.md)
- [Technology Stack](file:///h:/Antigravity/DinePosAi/docs/tech-stack.md)
- [Folder Structure](file:///h:/Antigravity/DinePosAi/docs/folder-structure.md)
- [Database Reference](file:///h:/Antigravity/DinePosAi/docs/database.md)
- [Authentication](file:///h:/Antigravity/DinePosAi/docs/authentication.md)
- [Authorization](file:///h:/Antigravity/DinePosAi/docs/authorization.md)
- [API Reference](file:///h:/Antigravity/DinePosAi/docs/api.md)
- [Frontend Architecture](file:///h:/Antigravity/DinePosAi/docs/frontend.md)
- [Backend Engine](file:///h:/Antigravity/DinePosAi/docs/backend.md)
- [Third-Party Integrations](file:///h:/Antigravity/DinePosAi/docs/integrations.md)
- [Deployment Guide](file:///h:/Antigravity/DinePosAi/docs/deployment.md)
- [Environment Variables](file:///h:/Antigravity/DinePosAi/docs/environment-variables.md)
- [Testing Guide](file:///h:/Antigravity/DinePosAi/docs/testing.md)
- [Troubleshooting & FAQs](file:///h:/Antigravity/DinePosAi/docs/troubleshooting.md)

---

## 15. Recommended Agent Workflow Before Code Changes

Before proposing or executing any code edits, an AI coding agent MUST follow this sequence:

1. **Step 1: Inspect Target Files**: Use `view_file` to read the exact implementation files and relevant type definitions in `@dineposai/shared-types`.
2. **Step 2: Inspect Security & Tenant Boundaries**: Confirm whether the target change affects multi-tenant isolation (`tenant_id`), authentication, or role permissions.
3. **Step 3: Formulate Plan**: Present a clear plan to the user specifying modified files and verification steps.
4. **Step 4: Execute & Verify**: Perform edits cleanly, run `pnpm build` or relevant smoke tests (`node apps/api/test_login_api.js`), and verify zero build errors.
