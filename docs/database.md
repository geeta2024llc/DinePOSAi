# DinePosAi - Database Architecture & Schema Reference

## 🗄 Overview

DinePosAi uses a **multi-tenant PostgreSQL** database instance hosted on Supabase.
All tenant tables enforce logical multi-tenancy using a `tenant_id UUID` foreign key referencing the central `tenants` table.

- **Primary Migration Bundle**: [combined_migrations.sql](file:///h:/Antigravity/DinePosAi/supabase/combined_migrations.sql)
- **RLS Policy Definitions**: [20260602000001_rls_policies.sql](file:///h:/Antigravity/DinePosAi/supabase/migrations/20260602000001_rls_policies.sql)
- **Database Deployment Script**: [deploy-migrations.js](file:///h:/Antigravity/DinePosAi/scripts/deploy-migrations.js)

---

## 📊 Complete Table Schema Directory

### 1. Tenants & Multi-Branch Core

#### `tenants`
Stores corporate accounts / restaurant organizations.
- **Columns**: `id` (UUID PK), `name` (TEXT), `country` (TEXT), `timezone` (TEXT), `currency` (TEXT, default 'JPY'), `tax_type` (TEXT: 'VAT'|'GST'|'NONE'), `tax_rate` (NUMERIC 5,2), `plan` (TEXT: 'TRIAL'|'ACTIVE'|'PAST_DUE'|'EXPIRED'|'SUSPENDED'), `status` (TEXT: 'ACTIVE'|'SUSPENDED'|'EXPIRED'), `onboarded` (BOOLEAN), `trial_ends_at` (TIMESTAMPTZ), `created_at`, `updated_at`.
- **Indexes**: `idx_tenants_country`, `idx_tenants_status`.

#### `branches`
Stores physical restaurant locations for a tenant.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `name` (TEXT), `address` (TEXT), `timezone` (TEXT), `is_active` (BOOLEAN), `created_at`, `updated_at`.
- **Indexes**: `idx_branches_tenant_id`.

---

### 2. User Authentication & Authorization

#### `users`
Stores employee and administrative staff user accounts.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `branch_id` (UUID FK -> `branches.id` SET NULL), `name` (TEXT), `email` (TEXT UNIQUE), `password_hash` (TEXT), `role` (TEXT: 'SUPER_ADMIN'|'OWNER'|'MANAGER'|'CASHIER'|'WAITER'|'KITCHEN'|'CUSTOMER'), `phone` (TEXT), `custom_permissions` (TEXT[] array), `is_active` (BOOLEAN), `last_login` (TIMESTAMPTZ), `created_at`, `updated_at`.
- **Indexes**: `idx_users_email`, `idx_users_tenant_id`, `idx_users_role`, `idx_users_branch_id`.

#### `user_sessions`
Active JWT session tracking and revocation table.
- **Columns**: `id` (UUID PK), `user_id` (UUID FK -> `users.id` CASCADE), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `branch_id` (UUID FK -> `branches.id` SET NULL), `device_id` (TEXT), `refresh_token` (TEXT), `device` (TEXT), `browser` (TEXT), `os` (TEXT), `ip_address` (TEXT), `country` (TEXT), `city` (TEXT), `login_time` (TIMESTAMPTZ), `last_activity` (TIMESTAMPTZ), `logout_time` (TIMESTAMPTZ), `is_current` (BOOLEAN), `expires_at` (TIMESTAMPTZ), `created_at`.
- **Indexes**: `idx_user_sessions_user_id`, `idx_user_sessions_refresh_token`, `idx_user_sessions_tenant_id`.

#### `login_history`
Security audit log for user sign-in attempts.
- **Columns**: `id` (UUID PK), `user_id` (UUID FK -> `users.id` SET NULL), `tenant_id` (UUID FK -> `tenants.id` SET NULL), `ip_address` (TEXT), `browser` (TEXT), `device` (TEXT), `os` (TEXT), `country` (TEXT), `city` (TEXT), `status` (TEXT: 'SUCCESS'|'FAILED'|'BLOCKED'), `failure_reason` (TEXT), `created_at`.
- **Indexes**: `idx_login_history_user_id`, `idx_login_history_tenant_id`, `idx_login_history_created_at`.

#### `user_permissions`
System-wide role-to-permission mapping table.
- **Columns**: `id` (UUID PK), `role` (TEXT), `permission` (TEXT).
- **Constraints**: `UNIQUE(role, permission)`.
- **Indexes**: `idx_user_permissions_role`.

---

### 3. Menu & Catalog Management

#### `categories`
Food and beverage categories (e.g. Appetizers, Mains, Drinks).
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `name` (TEXT), `is_active` (BOOLEAN), `created_at`.
- **Indexes**: `idx_categories_tenant_id`.

#### `menu_items`
Dishes and menu items available for order.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `category_id` (UUID FK -> `categories.id` CASCADE), `name` (TEXT), `description` (TEXT), `price` (NUMERIC 10,2), `image_url` (TEXT), `is_available` (BOOLEAN), `created_at`, `updated_at`.
- **Indexes**: `idx_menu_items_tenant_category`, `idx_menu_items_is_available`.

#### `item_variants`
Size or portion variations (e.g. Small, Medium, Large).
- **Columns**: `id` (UUID PK), `menu_item_id` (UUID FK -> `menu_items.id` CASCADE), `name` (TEXT), `price_modifier` (NUMERIC 10,2).
- **Indexes**: `idx_item_variants_menu_item`.

#### `item_addons`
Add-ons or extra toppings (e.g. Extra Cheese +$1.50).
- **Columns**: `id` (UUID PK), `menu_item_id` (UUID FK -> `menu_items.id` CASCADE), `name` (TEXT), `price` (NUMERIC 10,2).
- **Indexes**: `idx_item_addons_menu_item`.

---

### 4. Tables & Order Operations

#### `tables`
Dining room physical tables.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `name` (TEXT), `status` (TEXT: 'AVAILABLE'|'OCCUPIED'|'RESERVED'), `created_at`.
- **Indexes**: `idx_tables_tenant_id`, `idx_tables_status`.

#### `orders`
Core order header table.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `table_id` (UUID FK -> `tables.id` SET NULL), `customer_type` (TEXT: 'DINE_IN'|'TAKE_OUT'|'DELIVERY'), `status` (TEXT: 'PENDING'|'ACCEPTED'|'COOKING'|'READY'|'SERVED'|'CANCELLED'), `subtotal` (NUMERIC 10,2), `tax` (NUMERIC 10,2), `discount` (NUMERIC 10,2), `total` (NUMERIC 10,2), `created_by` (UUID FK -> `users.id` SET NULL), `created_at`, `updated_at`.
- **Indexes**: `idx_orders_tenant_status`, `idx_orders_table_id`, `idx_orders_created_at`.

#### `order_items`
Individual line items attached to an order.
- **Columns**: `id` (UUID PK), `order_id` (UUID FK -> `orders.id` CASCADE), `menu_item_id` (UUID FK -> `menu_items.id` SET NULL), `name` (TEXT), `quantity` (INTEGER), `price` (NUMERIC 10,2), `status` (TEXT: 'PENDING'|'COOKING'|'READY'|'SERVED'), `notes` (TEXT).
- **Indexes**: `idx_order_items_order_id`, `idx_order_items_status`.

#### `order_item_addons`
Selected add-ons for a line item.
- **Columns**: `id` (UUID PK), `order_item_id` (UUID FK -> `order_items.id` CASCADE), `addon_name` (TEXT), `price` (NUMERIC 10,2).
- **Indexes**: `idx_order_item_addons_item`.

---

### 5. Financials, Payments & Cash Drawer

#### `payments`
Financial transactions settling an order.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `order_id` (UUID FK -> `orders.id` CASCADE), `method` (TEXT: 'CASH'|'CARD'|'QR'|'MIXED'), `amount_paid` (NUMERIC 10,2), `change_returned` (NUMERIC 10,2), `status` (TEXT: 'SUCCESS'|'FAILED'|'PENDING'|'REFUNDED'), `transaction_ref` (TEXT), `created_at`.
- **Indexes**: `idx_payments_tenant_id`, `idx_payments_order_id`, `idx_payments_status`.

#### `payment_splits`
Split breakdown for 'MIXED' payment transactions.
- **Columns**: `id` (UUID PK), `payment_id` (UUID FK -> `payments.id` CASCADE), `method` (TEXT: 'CASH'|'CARD'|'QR'), `amount` (NUMERIC 10,2).
- **Indexes**: `idx_payment_splits_payment`.

#### `cash_drawers`
Terminal cash register configuration.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `name` (TEXT), `is_enabled` (BOOLEAN), `opening_balance` (NUMERIC 10,2), `auto_open_on_cash` (BOOLEAN), `created_at`, `updated_at`.
- **Indexes**: `idx_cash_drawers_tenant`.

#### `cash_movements`
Ledger of cash drawer events (Cash In, Cash Out, No Sale).
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `drawer_id` (UUID FK -> `cash_drawers.id` CASCADE), `type` (TEXT: 'CASH_IN'|'CASH_OUT'|'NO_SALE'|'CASH_SALE'|'REFUND'), `amount` (NUMERIC 10,2), `reason` (TEXT), `note` (TEXT), `user_id` (UUID), `user_name` (TEXT), `created_at`.
- **Indexes**: `idx_cash_movements_tenant`, `idx_cash_movements_drawer`, `idx_cash_movements_type`.

---

### 6. Inventory & Recipe Management

#### `inventory_items`
Raw ingredients and stock items.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `name` (TEXT), `sku` (TEXT), `unit` (TEXT), `cost_per_unit` (NUMERIC 10,2), `stock_level` (NUMERIC 10,3), `min_stock_level` (NUMERIC 10,3), `created_at`, `updated_at`.
- **Indexes**: `idx_inventory_items_tenant`, `idx_inventory_items_name`.

#### `menu_item_recipes`
Ingredient recipe formulas linking menu items to inventory stock.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `menu_item_id` (UUID FK -> `menu_items.id` CASCADE), `item_variant_id` (UUID FK -> `item_variants.id` CASCADE), `ingredient_id` (UUID FK -> `inventory_items.id` CASCADE), `quantity` (NUMERIC 10,3), `created_at`, `updated_at`.
- **Indexes**: `idx_menu_item_recipes_tenant`, `idx_menu_item_recipes_menu_item`, `idx_menu_item_recipes_ingredient`.

#### `waste_logs`
Ingredient spoilage and wastage tracking log.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `ingredient_id` (UUID FK -> `inventory_items.id` CASCADE), `quantity` (NUMERIC 10,3), `reason` (TEXT: 'SPOILAGE'|'ACCIDENT'|'EXPIRED'|'QUALITY_CONTROL'), `notes` (TEXT), `reported_by` (UUID FK -> `users.id` SET NULL), `created_at`.
- **Indexes**: `idx_waste_logs_tenant`, `idx_waste_logs_ingredient`.

#### `inventory_transactions`
Auditable inventory movements ledger.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `ingredient_id` (UUID FK -> `inventory_items.id` CASCADE), `type` (TEXT: 'PURCHASE'|'SALE_DEDUCTION'|'WASTE'|'MANUAL_ADJUSTMENT'|'REFUND_RESTOCK'), `quantity` (NUMERIC 10,3), `reference_id` (UUID), `notes` (TEXT), `created_by` (UUID FK -> `users.id` SET NULL), `created_at`.
- **Indexes**: `idx_inventory_transactions_tenant`, `idx_inventory_transactions_ingredient`, `idx_inventory_transactions_type`.

---

### 7. SaaS Administration & Audit Logs

#### `super_admins`
Platform administrator credentials.
- **Columns**: `id` (UUID PK), `email` (TEXT UNIQUE), `password_hash` (TEXT), `created_at`.

#### `audit_logs`
System activity audit trail.
- **Columns**: `id` (UUID PK), `tenant_id` (UUID FK -> `tenants.id` CASCADE), `user_id` (UUID FK -> `users.id` SET NULL), `branch_id` (UUID FK -> `branches.id` SET NULL), `action` (TEXT), `entity_type` (TEXT), `entity_id` (UUID), `metadata` (JSONB), `ip_address` (TEXT), `device` (TEXT), `created_at`.
- **Indexes**: `idx_audit_logs_tenant_id`, `idx_audit_logs_created_at`, `idx_audit_logs_branch_id`.

---

## 🔒 Row-Level Security (RLS) & RPC Functions

### Database Row-Level Security
RLS is enabled across all tenant-scoped tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
To ensure maximum security and avoid accidental data exposure from standard client libraries, tables restrict direct client access policies (`deny_direct_access` returning `USING (false)`), forcing data queries to route through the Express API backend using `SUPABASE_SERVICE_ROLE_KEY`.

### Custom Stored Functions (RPCs)
- **`increment_stock(ingredient_id UUID, quantity NUMERIC)`**: Atomically increments stock level in `inventory_items`.
- **`decrement_stock(ingredient_id UUID, quantity NUMERIC)`**: Atomically decrements stock level in `inventory_items`.
- **`set_updated_at()`**: Trigger function automatically updating `updated_at` timestamps before record modifications.
