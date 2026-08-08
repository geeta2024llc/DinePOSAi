# Architectural Decision Record (ADR) 0001: Monorepo Workspaces

## 📅 Status
**Accepted**

## 💡 Context
The DinePosAi platform consists of a Next.js web application (`apps/web`), an Express REST API server (`apps/api`), database schema migrations (`supabase`), and shared domain data models. Maintaining separate repositories would lead to duplicated TypeScript interfaces and schema desynchronization between frontend UI screens and backend API controllers.

## 🎯 Decision
Adopt a **pnpm monorepo workspace structure** with shared packages (`packages/shared-types`).

## ⚡ Consequences
- **Positive**: Single repository source of truth. TypeScript type definitions and permissions are declared once in `@dineposai/shared-types` and shared across frontend and backend.
- **Positive**: Atomic multi-package builds using `pnpm --filter "*" build`.
- **Negative**: Requires pnpm package manager (`npm` or `yarn` must not be used).

---

## 🔗 Related Documentation

- [[architecture]] — Monorepo package architecture overview and system diagram.
- [[folder-structure]] — Monorepo workspace directory map (`apps/`, `packages/`, `supabase/`).
- [[tech-stack]] — Monorepo package manager (`pnpm`) and TypeScript versions.

