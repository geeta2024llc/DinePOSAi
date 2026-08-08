# Feature Specification: POS Cashier & Checkout

## 🛒 Feature Overview

The **Cashier Point-of-Sale (POS)** terminal ([apps/web/app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)) is the primary interface for Front-of-House (FOH) restaurant staff to create orders, manage floor tables, process payments, split checks, and generate customer receipts.

---

## 🏛 Key Implementation Touchpoints

- **Page Entrypoint**: [app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx)
- **UI Components**: [src/components/pos/](file:///h:/Antigravity/DinePosAi/apps/web/src/components/pos) (`BillSplitter.tsx`, `Cart.tsx`, `TableGrid.tsx`, `ReceiptModal.tsx`)
- **Backend Controller**: [order.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/order.controller.ts)
- **Routes**: [order.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/order.routes.ts)

---

## 🔄 Core Cashier Workflow

1. **Table Selection**: Cashier views the interactive table grid (`TableGrid.tsx`) showing real-time table statuses (`AVAILABLE`, `OCCUPIED`, `RESERVED`).
2. **Order Building**: Cashier selects items from active categories. For each item:
   - Selects variants (e.g. Small, Medium, Large).
   - Toggles optional add-ons (e.g. Extra Sauce, Cheese).
   - Appends kitchen notes (e.g. *"No onions, allergic"*).
3. **Submitting to Kitchen**: Tapping "Send to Kitchen" dispatches `POST /api/orders`.
   - Backend inserts record in `orders` table (`status = PENDING`).
   - Inserts child records in `order_items` and `order_item_addons`.
   - Updates target table status to `OCCUPIED`.
4. **Checkout & Bill Splitting**:
   - Tapping "Pay Now" opens checkout modal (`BillSplitter.tsx`).
   - Payment method options: `CASH`, `CARD`, `QR`, or `MIXED`.
   - If `MIXED` is selected, cashier can split bill evenly or specify custom amounts across cash and card.
5. **Receipt Generation**:
   - Triggers `printReceipt()` via `PrinterContext`.
   - Encodes ESC/POS byte commands and dispatches raw TCP packet to thermal printer or opens browser print dialog.
