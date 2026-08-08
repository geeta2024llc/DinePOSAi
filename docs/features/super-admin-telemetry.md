# Feature Specification: Super Admin & System Telemetry

## 👑 Feature Overview

The **Super Admin Console** ([apps/web/app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)) is the SaaS platform administrator interface for monitoring global platform health, tenant roster analytics, MRR tracking, tenant status overrides, support helpdesk ticketing, and global system configuration.

---

## 🏛 Key Implementation Touchpoints

- **Page Entrypoint**: [app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)
- **UI Components**: [src/components/super-admin/](file:///h:/Antigravity/DinePosAi/apps/web/src/components/super-admin) (`TenantManager.tsx`, `SystemAnalytics.tsx`, `SupportManager.tsx`, `AccessManager.tsx`, `CmsManager.tsx`, `ReferralsManager.tsx`)
- **Admin Controller**: [admin.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/admin.controller.ts)
- **Admin Routes**: [admin.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/admin.routes.ts)
- **Role Requirement**: `SUPER_ADMIN`

---

## 📊 Super Admin Dashboard Capabilities

1. **Global SaaS Telemetry & Analytics** (`SystemAnalytics.tsx`): Displays total platform MRR, total registered tenant count, active vs trial breakdown, and total orders processed across all venues.
2. **Tenant Roster Management** (`TenantManager.tsx`): Inspect individual tenant workspace details (`/api/admin/tenants/:id/details`), extend trial periods, or perform bulk tenant cleanup (`POST /api/admin/tenants/bulk-delete`).
3. **Tenant Action Overrides**: Suspend or activate tenant accounts (`PATCH /api/admin/tenants/:id`).
4. **Support Ticket Helpdesk** (`SupportManager.tsx`): Manage and resolve merchant support helpdesk tickets.
5. **Platform Access & Audit Hierarchy** (`AccessManager.tsx`): Inspect global cross-tenant activity logs for security monitoring (`GET /api/admin/audit-hierarchy`).
