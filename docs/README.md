# DinePosAi Project Documentation Index

Welcome to the comprehensive technical documentation for **DinePosAi** — an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system and point-of-sale platform designed for hospitality environments.

> [!NOTE]
> This documentation is empirically derived directly from the source code, database migrations, and API contracts.

---

## 📚 Core System Documentation

1. [[project-overview]] — High-level goals, tenant architecture, target persona roles, and core SaaS capabilities.
2. [[architecture]] — System component diagrams, monorepo breakdown, frontend-backend flow, and network topologies.
3. [[tech-stack]] — Inventory of all languages, frameworks, third-party libraries, engines, and versions.
4. [[folder-structure]] — Directory map for `apps/web`, `apps/api`, `packages/shared-types`, `supabase/`, and scripts.
5. [[database]] — Complete relational tables, foreign key constraints, RLS security policies, and custom RPC functions.
6. [[authentication]] — JWT issuance, memory caching, Supabase session tracking, refresh token rotation, and password flows.
7. [[authorization]] — Permission matrices across system roles (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`).
8. [[api]] — Full REST API documentation covering request schemas, HTTP response codes, headers, and controllers.
9. [[frontend]] — Next.js App Router design, UI component hierarchy, HSL design system, context providers, and client state management.
10. [[backend]] — Express server pipeline, middleware chain, error handling, rate limiting, and process lifecycle.
11. [[integrations]] — Detailed reference for Stripe, Google Gemini AI, Resend Email, ESC/POS hardware, Sentry, and PostHog.
12. [[deployment]] — Docker containerization, Railway/Render API setup, Vercel frontend hosting, and database migration runner.
13. [[environment-variables]] — Comprehensive reference for API backend and Web frontend `.env` configuration.
14. [[testing]] — Test suite layout, standalone integration scripts, and verification procedures.
15. [[troubleshooting]] — Guide for resolving common database, auth, Stripe webhook, thermal printer, and CORS issues.

---

## 🎨 Major Feature Specifications

- [[features/pos-cashier-checkout]] — Order creation, split payments, table assignment, and hardware receipt generation.
- [[features/kitchen-display-system]] — Live order status tracking, kitchen ticket display, audio notifications, and state transitions.
- [[features/digital-menu-ai-concierge]] — Public digital ordering, table QR scanning, and Google Gemini AI sommelier assistant.
- [[features/inventory-stock-management]] — Item recipe links, automatic stock deduction on sale, waste logging, purchase orders, and supplier directory.
- [[features/multi-tenant-onboarding-billing]] — Self-serve business signup, trial tracking, Stripe subscriptions, billing portal, and branch expansion.
- [[features/super-admin-telemetry]] — Multi-tenant global management, system metrics, audit logging, support helpdesk, and tenant suspension.
- [[features/hardware-thermal-printing]] — Direct TCP socket ESC/POS receipt rendering, cash drawer kick pulse, and browser fallback.

---

## 📐 Architectural Decisions (ADRs)

- [[decisions/0001-monorepo-structure]] — Decision to adopt pnpm workspaces with shared type packages.
- [[decisions/0002-multi-tenancy-isolation]] — Single database with row-level security (RLS) and strict middleware validation.
- [[decisions/0003-thermal-printer-integration]] — Pure binary byte stream over raw TCP sockets vs browser print dialogs.
- [[decisions/0004-ai-concierge-gemini]] — Public unauthenticated endpoint utilizing Google Gemini REST API.

---

## 🤖 AI Agent Context & Rules

- [[ai-context/coding-rules]] — Conventions for file naming, TypeScript typing, React hooks, API contracts, and error responses.
- [[ai-context/important-files]] — Crucial touchpoint map for AI agents modifying specific features.
- [[ai-context/common-patterns]] — Key design patterns for middleware, modal state, RPC calls, and error handling.
- [[ai-context/known-limitations]] — Comprehensive audit of existing TODOs, FIXMEs, incomplete features, and architectural risks.
- [[AGENTS]] — Quick-start directive document for AI agents operating in this workspace.
