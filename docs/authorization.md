# DinePosAi - Authorization & Role-Based Access Control (RBAC)

## 🛡 Overview

DinePosAi features a fine-grained **Role-Based Access Control (RBAC)** model combined with **Tenant Boundary Isolation**.

- **System Roles**: 7 predefined roles (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`).
- **Granular Permissions**: 26 specific permission string keys defined in `PERMISSIONS` ([shared-types/src/index.ts](file:///h:/Antigravity/DinePosAi/packages/shared-types/src/index.ts)).
- **Custom User Overrides**: The `users.custom_permissions` array column allows granting specific permission overrides per individual employee.
- **Super Admin Bypass**: Users with the `SUPER_ADMIN` role bypass all permission checks and tenant boundaries.

---

## 🔑 System Role Permission Matrix

| Permission Key | Description | SUPER_ADMIN | OWNER | MANAGER | CASHIER | WAITER | KITCHEN | CUSTOMER |
|----------------|-------------|:-----------:|:-----:|:-------:|:-------:|:------:|:-------:|:--------:|
| `orders.create` | Place new orders | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `orders.edit` | Modify active order items | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `orders.refund` | Process order refunds | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `orders.cancel` | Void/cancel orders | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `invoice.print` | Generate receipts/invoices | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `tables.view` | View floor plan & tables | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `tables.manage` | Add/edit dining room tables | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `menu.view` | Browse menu items & prices | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `menu.manage` | Create/edit categories & dishes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `kds.view` | View kitchen display queue | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `kds.update` | Advance order status (Cooking/Ready) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `inventory.view` | Inspect stock levels & recipes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `inventory.manage` | Adjust stock, recipes, POs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `staff.view` | View team members | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `staff.invite` | Invite new staff members | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `staff.manage` | Edit staff roles & permissions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `billing.view` | View subscription details | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `billing.manage` | Change plans, Stripe billing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reports.view` | View financial sales reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settings.manage` | Edit tax rates, business info | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit.view` | Inspect activity audit logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `system.manage` | Platform-wide SaaS operations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `cash_drawer.open` | Open physical drawer | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `cash_drawer.cash_in` | Perform cash-in operation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `cash_drawer.cash_out` | Perform cash-out operation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `cash_drawer.no_sale` | Trigger no-sale drawer pop | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🛠 Permission Enforcement Middleware

Authorization is enforced using dedicated Express middleware functions:

### 1. Granular Permission Guard (`requirePermission`)
File: [permission.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/permission.middleware.ts)

```typescript
// Requires exact permission 'menu.manage'
router.post('/items', requirePermission('menu.manage'), createMenuItem);

// Matches ANY of the listed permissions (e.g. Cashier OR Kitchen viewing active orders)
router.get('/', requirePermission(['tables.view', 'kds.view'], { match: 'any' }), getActiveOrders);
```

### 2. Multi-Tenant Organization Isolation (`requireOrganizationMatch`)
File: [organization.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/organization.middleware.ts)

```typescript
// Compares target tenantId in route params, body, or query against req.user.tenantId
router.use(requireOrganizationMatch);
```

- Blocks users from querying or altering data belonging to a different tenant UUID.
- Returns HTTP 403 `Access Denied: You cannot access or modify resources belonging to another organization.` if tenant IDs mismatch.

### 3. Tenant Status Guard (`validateOrganizationActive`)
- Queries `tenants` table to verify `status === 'ACTIVE'`.
- Returns HTTP 403 if tenant status is `SUSPENDED` or `EXPIRED`.
