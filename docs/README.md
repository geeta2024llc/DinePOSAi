# DinePosAi Project Documentation Index

Welcome to the comprehensive technical documentation for **DinePosAi** — an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system and point-of-sale platform designed for hospitality environments.

> [!NOTE]
> This documentation is empirically derived directly from the source code, database migrations, and API contracts.

---

## 📚 Core System Documentation

1. [Project Overview](file:///h:/Antigravity/DinePosAi/docs/project-overview.md) — High-level goals, tenant architecture, target persona roles, and core SaaS capabilities.
2. [Architecture](file:///h:/Antigravity/DinePosAi/docs/architecture.md) — System component diagrams, monorepo breakdown, frontend-backend flow, and network topologies.
3. [Tech Stack](file:///h:/Antigravity/DinePosAi/docs/tech-stack.md) — Inventory of all languages, frameworks, third-party libraries, engines, and versions.
4. [Folder Structure](file:///h:/Antigravity/DinePosAi/docs/folder-structure.md) — Directory map for `apps/web`, `apps/api`, `packages/shared-types`, `supabase/`, and scripts.
5. [Database Schema](file:///h:/Antigravity/DinePosAi/docs/database.md) — Complete relational tables, foreign key constraints, RLS security policies, and custom RPC functions.
6. [Authentication](file:///h:/Antigravity/DinePosAi/docs/authentication.md) — JWT issuance, memory caching, Supabase session tracking, refresh token rotation, and password flows.
7. [Authorization & RBAC](file:///h:/Antigravity/DinePosAi/docs/authorization.md) — Permission matrices across system roles (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`).
8. [API Endpoints Reference](file:///h:/Antigravity/DinePosAi/docs/api.md) — Full REST API documentation covering request schemas, HTTP response codes, headers, and controllers.
9. [Frontend Architecture](file:///h:/Antigravity/DinePosAi/docs/frontend.md) — Next.js App Router design, UI component hierarchy, HSL design system, context providers, and client state management.
10. [Backend Engine](file:///h:/Antigravity/DinePosAi/docs/backend.md) — Express server pipeline, middleware chain, error handling, rate limiting, and process lifecycle.
11. [Third-Party Integrations](file:///h:/Antigravity/DinePosAi/docs/integrations.md) — Detailed reference for Stripe, Google Gemini AI, Resend Email, ESC/POS hardware, Sentry, and PostHog.
12. [Deployment & Infrastructure](file:///h:/Antigravity/DinePosAi/docs/deployment.md) — Docker containerization, Railway/Render API setup, Vercel frontend hosting, and database migration runner.
13. [Environment Variables](file:///h:/Antigravity/DinePosAi/docs/environment-variables.md) — Comprehensive reference for API backend and Web frontend `.env` configuration.
14. [Testing & Quality Assurance](file:///h:/Antigravity/DinePosAi/docs/testing.md) — Test suite layout, standalone integration scripts, and verification procedures.
15. [Troubleshooting & FAQs](file:///h:/Antigravity/DinePosAi/docs/troubleshooting.md) — Guide for resolving common database, auth, Stripe webhook, thermal printer, and CORS issues.

---

## 🎨 Major Feature Specifications

- [POS Cashier & Checkout](file:///h:/Antigravity/DinePosAi/docs/features/pos-cashier-checkout.md) — Order creation, split payments, table assignment, and hardware receipt generation.
- [Kitchen Display System (KDS)](file:///h:/Antigravity/DinePosAi/docs/features/kitchen-display-system.md) — Live order status tracking, kitchen ticket display, audio notifications, and state transitions.
- [Digital Guest Menu & AI Concierge](file:///h:/Antigravity/DinePosAi/docs/features/digital-menu-ai-concierge.md) — Public digital ordering, table QR scanning, and Google Gemini AI sommelier assistant.
- [Inventory & Stock Tracking](file:///h:/Antigravity/DinePosAi/docs/features/inventory-stock-management.md) — Item recipe links, automatic stock deduction on sale, waste logging, purchase orders, and supplier directory.
- [Multi-Tenant Onboarding & Stripe Billing](file:///h:/Antigravity/DinePosAi/docs/features/multi-tenant-onboarding-billing.md) — Self-serve business signup, trial tracking, Stripe subscriptions, billing portal, and branch expansion.
- [Super Admin & System Telemetry](file:///h:/Antigravity/DinePosAi/docs/features/super-admin-telemetry.md) — Multi-tenant global management, system metrics, audit logging, support helpdesk, and tenant suspension.
- [Hardware Thermal Printing](file:///h:/Antigravity/DinePosAi/docs/features/hardware-thermal-printing.md) — Direct TCP socket ESC/POS receipt rendering, cash drawer kick pulse, and browser fallback.

---

## 📐 Architectural Decisions (ADRs)

- [ADR 0001: Monorepo Structure](file:///h:/Antigravity/DinePosAi/docs/decisions/0001-monorepo-structure.md) — Decision to adopt pnpm workspaces with shared type packages.
- [ADR 0002: Multi-Tenancy Isolation Strategy](file:///h:/Antigravity/DinePosAi/docs/decisions/0002-multi-tenancy-isolation.md) — Single database with row-level security (RLS) and strict middleware validation.
- [ADR 0003: Thermal Printer ESC/POS Encoding](file:///h:/Antigravity/DinePosAi/docs/decisions/0003-thermal-printer-integration.md) — Pure binary byte stream over raw TCP sockets vs browser print dialogs.
- [ADR 0004: AI Concierge Integration Strategy](file:///h:/Antigravity/DinePosAi/docs/decisions/0004-ai-concierge-gemini.md) — Public unauthenticated endpoint utilizing Google Gemini REST API.

---

## 🤖 AI Agent Context & Rules

- [Coding Rules & Standards](file:///h:/Antigravity/DinePosAi/docs/ai-context/coding-rules.md) — Conventions for file naming, TypeScript typing, React hooks, API contracts, and error responses.
- [Important Files Map](file:///h:/Antigravity/DinePosAi/docs/ai-context/important-files.md) — Crucial touchpoint map for AI agents modifying specific features.
- [Common Code Patterns](file:///h:/Antigravity/DinePosAi/docs/ai-context/common-patterns.md) — Key design patterns for middleware, modal state, RPC calls, and error handling.
- [Known Limitations & Tech Debt](file:///h:/Antigravity/DinePosAi/docs/ai-context/known-limitations.md) — Comprehensive audit of existing TODOs, FIXMEs, incomplete features, and architectural risks.
- [Primary Agent Guidelines (Root AGENTS.md)](file:///h:/Antigravity/DinePosAi/AGENTS.md) — Quick-start directive document for AI agents operating in this workspace.
