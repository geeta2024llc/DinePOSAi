# Important Files Map for AI Agents

## 🗺 Essential Subsystem Touchpoints

### 1. Types & Declarations
- [packages/shared-types/src/index.ts](file:///h:/Antigravity/DinePosAi/packages/shared-types/src/index.ts): Central schema definition for all entity models, enums, permissions, and API response envelope.

### 2. Backend Server & Middleware Pipeline
- [apps/api/src/server.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/server.ts): Express server entrypoint, CORS configuration, rate limiters, route mounting, graceful shutdown.
- [apps/api/src/middleware/auth.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/auth.ts): JWT authentication validator & session cache (`requireAuth`).
- [apps/api/src/middleware/organization.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/organization.middleware.ts): Multi-tenant isolation guard (`requireOrganizationMatch`).
- [apps/api/src/middleware/permission.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/permission.middleware.ts): Granular RBAC guard (`requirePermission`).

### 3. Key Controllers
- [apps/api/src/controllers/order.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/order.controller.ts): Order creation, status updates, and kitchen queue processing.
- [apps/api/src/controllers/auth.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/auth.controller.ts): Login, registration, session management, and password resets.
- [apps/api/src/controllers/billing.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/billing.controller.ts): Stripe checkout, subscription management, and webhook events.
- [apps/api/src/controllers/inventory.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/inventory.controller.ts): Stock management, recipes, waste logging, purchase orders.

### 4. Frontend Key Pages & Contexts
- [apps/web/app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx): Cashier POS terminal UI.
- [apps/web/app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx): Kitchen Display System UI.
- [apps/web/app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx): Public guest digital menu & AI Concierge.
- [apps/web/app/authContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/authContext.tsx): Global React authentication state context.
- [apps/web/app/printerContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/printerContext.tsx): Hardware receipt printer socket context.

### 5. Database & Migrations
- [supabase/migrations/20260602000000_init.sql](file:///h:/Antigravity/DinePosAi/supabase/migrations/20260602000000_init.sql): Initial table schemas.
- [supabase/migrations/20260602000001_rls_policies.sql](file:///h:/Antigravity/DinePosAi/supabase/migrations/20260602000001_rls_policies.sql): Row-Level Security policies.
- [supabase/migrations/20260612000002_inventory.sql](file:///h:/Antigravity/DinePosAi/supabase/migrations/20260612000002_inventory.sql): Inventory & stock management tables.

---

## 🔗 Related Documentation

- [[architecture]] — Overall system architecture and monorepo component layout.
- [[folder-structure]] — Monorepo file tree reference.
- [[frontend]] — Web frontend Next.js App Router design.
- [[backend]] — Express REST API engine and controller architecture.

