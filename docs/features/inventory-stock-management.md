# Feature Specification: Inventory & Stock Management

## 📦 Feature Overview

The **Inventory & Stock Management Module** ([inventory.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/inventory.controller.ts)) allows restaurant managers to track raw ingredient stock levels, define recipe formulas for menu items, log kitchen waste/spoilage, manage supplier contacts, and issue purchase orders.

---

## 🏛 Key Implementation Touchpoints

- **Backend Controller**: [inventory.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/inventory.controller.ts)
- **Routes**: [inventory.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/inventory.routes.ts)
- **Database Tables**: `inventory_items`, `menu_item_recipes`, `waste_logs`, `suppliers`, `purchase_orders`, `purchase_order_items`, `inventory_transactions`
- **Helper Utilities**: [inventoryUtils.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/inventoryUtils.ts)

---

## 🔄 Core Capabilities

1. **Recipe Stock Linkage**: Links menu items to raw ingredients in `menu_item_recipes` (e.g. 1 Cheeseburger = 0.2 kg Beef, 1 Bun, 1 Slice Cheese).
2. **Automatic Stock Deduction**: Selling menu items automatically deducts raw ingredient stock levels using atomic database RPC functions (`decrement_stock`).
3. **Low Stock Alerts**: Identifies ingredients falling below `min_stock_level`.
4. **Waste & Spoilage Logging**: Records spoiled or expired inventory in `waste_logs` with specific reason classifications (`SPOILAGE`, `ACCIDENT`, `EXPIRED`, `QUALITY_CONTROL`).
5. **Purchase Order Restocking**: Generates purchase orders for suppliers (`purchase_orders`), automatically incrementing stock levels upon marking PO status `RECEIVED`.

---

## 🔗 Related Documentation

- [[architecture]] — Overall system architecture and RPC function execution pipeline.
- [[database]] — Database schema for `inventory_items`, `menu_item_recipes`, `waste_logs`, and `inventory_transactions`.
- [[api]] — Inventory management API endpoints reference (`/api/inventory/*`).
- [[authorization]] — Permissions matrix for `inventory.view` and `inventory.manage`.

