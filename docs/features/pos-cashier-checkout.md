# Feature Specification: POS Cashier & Checkout

## 🛒 Feature Overview

The **Cashier Point-of-Sale (POS)** terminal ([apps/web/app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)) is the primary interface for Front-of-House (FOH) restaurant staff to create orders, manage active orders, process payments, split checks, reconcile cash drawers, and generate customer receipts.

---

## 🏛 Key Implementation Touchpoints

- **Page Entrypoint**: [app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)
- **UI Components**: [src/components/pos/](file:///h:/Antigravity/DinePosAi/apps/web/src/components/pos) (`ActiveOrdersList.tsx`, `CashDrawerPanel.tsx`, `CheckoutModal.tsx`, `MenuCatalogModal.tsx`, `OrderDetailsPanel.tsx`, `SplitPaymentModal.tsx`)
- **Backend Controller**: [order.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/order.controller.ts)
- **Routes**: [order.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/order.routes.ts)

---

## 🔄 Core Cashier Workflow

1. **Active Orders & Table View**: Cashier views active orders list (`ActiveOrdersList.tsx`) and order details (`OrderDetailsPanel.tsx`).
2. **Order Building**: Cashier opens menu catalog modal (`MenuCatalogModal.tsx`) to select items from active categories. For each item:
   - Selects variants (e.g. Small, Medium, Large).
   - Toggles optional add-ons (e.g. Extra Sauce, Cheese).
   - Appends kitchen notes.
3. **Submitting to Kitchen**: Tapping "Send to Kitchen" dispatches `POST /api/orders`.
   - Backend inserts record in `orders` table (`status = PENDING`).
   - Inserts child records in `order_items` and `order_item_addons`.
   - Updates target table status to `OCCUPIED`.
4. **Checkout & Bill Splitting**:
   - Tapping "Pay Now" opens checkout modal (`CheckoutModal.tsx`).
   - Payment method options: `CASH`, `CARD`, `QR`, or `MIXED`.
   - If `MIXED` or split check is selected, opens `SplitPaymentModal.tsx` to split payment amounts across cash and card.
5. **Cash Drawer Management**:
   - `CashDrawerPanel.tsx` tracks opening balances, Cash In, Cash Out, and No Sale drawer triggers (`/api/tenant/cash-drawer` endpoints).
6. **Receipt Generation**:
   - Triggers `printReceipt()` via `PrinterContext`.
   - Encodes ESC/POS byte commands and dispatches raw TCP packet to thermal printer or opens browser print dialog.

---

## 🔗 Related Documentation

- [[architecture]] — Overall monorepo architecture and POS component hierarchy.
- [[database]] — Database schema for `orders`, `order_items`, `payments`, and `cash_drawers`.
- [[api]] — Order management and checkout API endpoints reference (`/api/orders/*`).
- [[authorization]] — Permissions matrix for `pos.access`, `orders.create`, and `payments.manage`.
- [[features/hardware-thermal-printing]] — Thermal printer hardware integration details.
- [[decisions/0003-thermal-printer-integration]] — Architectural Decision Record on ESC/POS binary encoding.
