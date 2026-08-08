# Feature Specification: Super Admin & System Telemetry

## 👑 Feature Overview

The **Super Admin Console** ([apps/web/app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)) is the SaaS platform administrator interface for monitoring global platform health, tenant roster analytics, MRR tracking, tenant status overrides, and system audit logs.

---

## 🏛 Key Implementation Touchpoints

- **Page Entrypoint**: [app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx)
- **Admin Controller**: [admin.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/admin.controller.ts)
- **Admin Routes**: [admin.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/admin.routes.ts)
- **Role Requirement**: `SUPER_ADMIN`

---

## 📊 Super Admin Dashboard Capabilities

1. **Global SaaS Telemetry**: Displays total platform MRR, total registered tenant count, active vs trial Breakdown, and total orders processed across all venues.
2. **Tenant Roster Management**: Inspect individual tenant workspace details (`/api/admin/tenants/:id/details`).
3. **Tenant Action Overrides**:
   - Suspend or activate tenant accounts (`PATCH /api/admin/tenants/:id`).
   - Bulk delete test or trial tenant accounts (`POST /api/admin/tenants/bulk-delete`).
4. **Platform Audit Hierarchy**: Inspect global cross-tenant activity logs for security monitoring (`GET /api/admin/audit-hierarchy`).
