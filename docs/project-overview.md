# DinePosAi - Project Overview

## 🎯 Executive Summary

**DinePosAi** is an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system tailored for restaurants, cafes, bars, and hospitality venues. It unifies front-of-house (FOH) order entry, split-bill checkouts, real-time kitchen production tracking (KDS), digital guest self-ordering with an integrated AI Sommelier/Concierge, inventory recipe costing, multi-branch management, and SaaS platform administration into a single high-performance web platform.

---

## 👥 Target Personas & Core User Roles

The platform supports 7 distinct user personas, each tied to specific UI screens and permission boundaries:

| User Role | Target Persona | Primary Interface | Primary Objectives |
|-----------|----------------|-------------------|--------------------|
| `SUPER_ADMIN` | Platform Operator / SaaS Founder | [/super-admin](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx) | Tenant onboarding, global subscription management, system health monitoring, support ticket management, platform audit log viewing. |
| `OWNER` | Restaurant Owner / Founder | [/dashboard](file:///h:/Antigravity/DinePosAi/apps/web/app/dashboard/page.tsx) | Business performance analytics, financial reports, subscription/billing management, staff user management, branch setup. |
| `MANAGER` | General Manager / Shift Lead | [/dashboard](file:///h:/Antigravity/DinePosAi/apps/web/app/dashboard/page.tsx) | Menu management, inventory tracking, purchase orders, waste logging, cash drawer reconciliation, staff scheduling. |
| `CASHIER` | FOH Cashier / Billing Staff | [/pos](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx) | Rapid ticket entry, table assignment, bill splitting, cash/card payment processing, hardware thermal receipt printing. |
| `WAITER` | Floor Waiter / Server | [/pos](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx) | Table-side order taking, sending tickets to kitchen, checking table statuses. |
| `KITCHEN` | BOH Chef / Line Cook | [/kds](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx) | Real-time order queue monitoring, changing item status (Pending -> Cooking -> Ready), audio alert triggers. |
| `CUSTOMER` | Restaurant Guest | [/menu](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx) | Table QR digital menu browsing, interactive AI Sommelier recommendations, self-checkout. |

---

## 🏢 Multi-Tenancy Architecture Model

DinePosAi operates on a **shared-database, multi-tenant model** where all tenants share the same PostgreSQL database instance on Supabase.

1. **Logical Isolation**: Every business entity is assigned a unique `tenant_id` UUID in the `tenants` table.
2. **Data Partitioning**: All core data entities (`users`, `categories`, `menu_items`, `tables`, `orders`, `inventory_items`, `audit_logs`) contain a required `tenant_id` foreign key.
3. **Branch Hierarchies**: Tenants can establish multiple physical locations (`branches` table) within their organization.
4. **Security Isolation**: Multi-tenancy is enforced both at the application level via Express middleware (`requireOrganizationMatch` in [organization.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/organization.middleware.ts)) and at the database level via Supabase Row-Level Security (RLS) policies in [20260602000001_rls_policies.sql](file:///h:/Antigravity/DinePosAi/supabase/migrations/20260602000001_rls_policies.sql).

---

## 🔄 Core Operating Workflows

### 1. Front-of-House (FOH) Point-of-Sale Workflow
- Cashier logs into the POS application (`/pos`).
- Selects an available table or selects Take Out / Delivery.
- Selects items from categories, configures item variants/addons, and applies item-level notes.
- Submits order: API creates order in `PENDING` state and automatically dispatches to kitchen displays (`/kds`).
- Accepts payment: supports Cash, Credit Card, QR Code, or Mixed split-payments.
- Automatically generates hardware thermal receipts via direct TCP ESC/POS byte streaming or triggers cash drawer pulse.

### 2. Back-of-House (BOH) Kitchen Display System (KDS) Workflow
- Kitchen staff open KDS interface (`/kds`).
- Page periodically polls `/api/orders` for active kitchen orders.
- New incoming orders trigger an audio alert tone.
- Line cooks update order state from `PENDING` -> `COOKING` -> `READY` -> `SERVED`.
- Item-level tracking allows individual items to be marked ready independently.

### 3. Digital Guest Menu & AI Sommelier Workflow
- Guests scan a table QR code navigating to `/menu?tenantId=...&tableId=...`.
- Browses live categories and menu items with real-time stock availability.
- Opens the **AI Concierge (Aura)** widget powered by Google Gemini.
- Asks food pairing or dietary questions (e.g., *"What wine pairs best with the Wagyu Steak?"*).
- AI responds with contextual recommendations based on the restaurant's live menu items.

### 4. SaaS Operations & Super Admin Workflow
- SaaS operators log into `/super-admin`.
- Monitor global MRR, active vs trial tenant counts, total system orders, and platform health telemetry.
- Onboard new restaurant tenants or extend free trial durations.
- Manage support desk tickets (`support_tickets` table).
- Suspend or activate delinquent tenant accounts.

---

## 🗺 Monorepo Workspace Structure

```
dineposai-monorepo/
├── apps/
│   ├── web/        # Next.js 16 App Router Frontend (POS, KDS, Guest Menu, Super Admin)
│   └── api/        # Express/Node.js REST API Backend
├── packages/
│   └── shared-types/ # Shared TypeScript interface declarations & permission constants
├── supabase/       # PostgreSQL migrations, schema DDL, RLS policies & RPC scripts
├── scripts/        # Database migration execution scripts
```

---

## 🔗 Related Documentation

- [[architecture]] — System component diagrams, monorepo breakdown, and request pipeline.
- [[database]] — Relational tables, foreign key constraints, and RLS policies.
- [[authentication]] — JWT authentication, session memory cache, and login flows.
- [[authorization]] — Granular role-based access control and permissions matrix.
- [[api]] — Complete REST API reference and payload envelope standards.

