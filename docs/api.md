# DinePosAi - REST API Reference Manual

## 📡 Overview & Response Standard

All backend endpoints are prefixed with `/api` and return a unified JSON envelope (`ApiResponse<T>`):

```json
{
  "success": true,
  "data": { ... },
  "error": "Optional error string message"
}
```

### HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure (Zod schema error or malformed body).
- `401 Unauthorized`: Missing Bearer token or invalid/expired session.
- `403 Forbidden`: Access denied (insufficient role permission or tenant isolation error).
- `404 Not Found`: Target entity or workspace does not exist.
- `429 Too Many Requests`: IP rate limit exceeded.
- `500 Internal Server Error`: Server exception.

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/auth/signup` | Public | Register a new user and tenant workspace. |
| `POST` | `/api/auth/login` | Public | Authenticate user email/password, returns JWT token & session. |
| `POST` | `/api/auth/refresh` | Public | Exchange refresh token for new access token. |
| `POST` | `/api/auth/forgot-password` | Public | Initiate password reset email request. |
| `POST` | `/api/auth/reset-password` | Public | Complete password reset using verification token. |
| `POST` | `/api/auth/reset-password-supabase` | Public | Reset password via Supabase token. |
| `POST` | `/api/auth/logout` | Bearer Token | Terminate current user session. |
| `POST` | `/api/auth/logout-all` | Bearer Token | Terminate all user sessions across devices. |
| `POST` | `/api/auth/change-password` | Bearer Token | Change authenticated user password. |
| `POST` | `/api/auth/change-email` | Bearer Token | Request email address change. |
| `GET` | `/api/auth/me` | Bearer Token | Fetch authenticated user profile & permissions. |
| `PUT` | `/api/auth/profile` | Bearer Token | Update user profile details (name, phone). |
| `GET` | `/api/auth/sessions` | Bearer Token | List all active login sessions for user. |
| `DELETE` | `/api/auth/sessions/:id` | Bearer Token | Revoke specific session ID. |
| `GET` | `/api/auth/login-history` | Bearer Token | Fetch user's sign-in history audit log. |

---

## 🏢 2. Tenant & Staff Endpoints (`/api/tenant`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `POST` | `/api/tenant/onboard` | Public | Complete business onboarding wizard. |
| `GET` | `/api/tenant/info` | Authenticated | Get current tenant profile & business settings. |
| `PUT` | `/api/tenant/info` | `settings.manage` | Update tenant details (currency, tax rate, name). |
| `GET` | `/api/tenant/staff` | `staff.view` | List all staff accounts for tenant. |
| `POST` | `/api/tenant/staff` | `staff.manage` | Add a new staff account. |
| `PUT` | `/api/tenant/staff/:id` | `staff.manage` | Edit staff role, branch, or custom permissions. |
| `DELETE` | `/api/tenant/staff/:id` | `staff.manage` | Deactivate/remove a staff account. |

---

## 🪑 3. Dining Room Tables Endpoints (`/api/tables`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `GET` | `/api/tables` | `tables.view` | List all dining room tables and real-time status. |
| `POST` | `/api/tables` | `tables.manage` | Add a new dining table. |
| `PUT` | `/api/tables/:id` | `tables.manage` | Edit table name or capacity. |
| `PATCH` | `/api/tables/:id/status` | `tables.manage` | Update table status (`AVAILABLE`, `OCCUPIED`, `RESERVED`). |
| `DELETE` | `/api/tables/:id` | `tables.manage` | Delete a table. |

---

## 🍔 4. Menu & Category Endpoints (`/api/menu`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `GET` | `/api/menu/public` | Public | Fetch public digital menu for QR ordering. |
| `GET` | `/api/menu/categories` | `menu.view` | Fetch menu categories. |
| `POST` | `/api/menu/categories` | `menu.manage` | Create a new menu category. |
| `PUT` | `/api/menu/categories/:id` | `menu.manage` | Update a category. |
| `DELETE` | `/api/menu/categories/:id` | `menu.manage` | Delete a category. |
| `GET` | `/api/menu/items` | `menu.view` | Fetch menu items with variants and add-ons. |
| `POST` | `/api/menu/items` | `menu.manage` | Create a new menu item. |
| `PUT` | `/api/menu/items/:id` | `menu.manage` | Update a menu item. |
| `DELETE` | `/api/menu/items/:id` | `menu.manage` | Delete a menu item. |

---

## 📦 5. Inventory & Recipe Endpoints (`/api/inventory`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `GET` | `/api/inventory/items` | `inventory.view` | List all inventory raw items & stock levels. |
| `POST` | `/api/inventory/items` | `inventory.manage` | Create a raw ingredient item. |
| `PUT` | `/api/inventory/items/:id` | `inventory.manage` | Update stock quantity or cost per unit. |
| `DELETE` | `/api/inventory/items/:id` | `inventory.manage` | Delete an inventory item. |
| `GET` | `/api/inventory/recipes` | `inventory.view` | List recipe links connecting dishes to stock. |
| `POST` | `/api/inventory/recipes` | `inventory.manage` | Add ingredient recipe formula to menu item. |
| `POST` | `/api/inventory/waste` | `inventory.manage` | Log inventory waste / spoilage. |
| `GET` | `/api/inventory/suppliers` | `inventory.view` | List supplier contacts directory. |
| `POST` | `/api/inventory/purchase-orders` | `inventory.manage` | Create purchase order to restock inventory. |

---

## 🧾 6. Order & KDS Endpoints (`/api/orders`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `POST` | `/api/orders` | `orders.create` | Submit new order from Cashier POS or Waiter. |
| `GET` | `/api/orders` | `tables.view` OR `kds.view` | Fetch active order queue for KDS display. |
| `PATCH` | `/api/orders/:id/status` | `orders.edit` OR `kds.update` | Update order status (`COOKING`, `READY`, `SERVED`). |

---

## 🤖 7. AI Concierge Endpoints (`/api/concierge`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/concierge/chat` | Public | Send prompt to Google Gemini AI sommelier chatbot. |

---

## 💳 8. Billing & Stripe Endpoints (`/api/billing`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `GET` | `/api/billing/subscription` | `billing.view` | Get current tenant subscription status & invoice history. |
| `POST` | `/api/billing/create-checkout` | `billing.manage` | Create Stripe Checkout Session for subscription upgrade. |
| `POST` | `/api/billing/portal` | `billing.manage` | Create Stripe Customer Portal session link. |
| `POST` | `/api/billing/webhook` | Stripe Webhook Secret | Asynchronous Stripe event listener. |

---

## 📋 9. Audit Logging Endpoints (`/api/audit`)

| Method | Endpoint | Permission Required | Description |
|--------|----------|---------------------|-------------|
| `GET` | `/api/audit` | `audit.view` | Query tenant activity audit logs. |

---

## 👑 10. Super Admin Endpoints (`/api/admin`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/admin/overview` | `SUPER_ADMIN` Role | Fetch system-wide SaaS telemetry and platform MRR. |
| `GET` | `/api/admin/tenants/:id/details` | `SUPER_ADMIN` Role | Fetch deep audit details for specific tenant. |
| `PATCH` | `/api/admin/tenants/:id` | `SUPER_ADMIN` Role | Suspend or activate tenant account. |
| `DELETE` | `/api/admin/tenants/:id` | `SUPER_ADMIN` Role | Delete single tenant workspace. |
| `POST` | `/api/admin/tenants/bulk-delete` | `SUPER_ADMIN` Role | Bulk delete tenant accounts. |
