# Feature Specification: Kitchen Display System (KDS)

## 🍳 Feature Overview

The **Kitchen Display System (KDS)** ([apps/web/app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx)) is the Back-of-House (BOH) interface for kitchen staff to view live incoming order tickets, track preparation time, advance item cooking states, and play audio chime alerts when new tickets arrive.

---

## 🏛 Key Implementation Touchpoints

- **Page Entrypoint**: [app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx)
- **Backend Controller**: [order.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/order.controller.ts)
- **Routes**: [order.routes.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/routes/order.routes.ts)
- **Permissions Required**: `kds.view`, `kds.update`

---

## 🔄 Kitchen Workflow & Order Transitions

1. **Ticket Queue Polling**: The KDS page periodically queries `GET /api/orders` to retrieve active kitchen orders.
2. **Audio Chime Alert**: When a new ticket in `PENDING` state arrives, the browser synthesizes an audio chime alert to notify line cooks.
3. **Status Transitions**:
   - **PENDING -> COOKING**: Cook taps "Start Cooking". Endpoint sends `PATCH /api/orders/:id/status` with status `COOKING`.
   - **COOKING -> READY**: Ticket turns green indicating food is prepared and ready for pick-up.
   - **READY -> SERVED**: FOH staff mark order served, removing it from active KDS view.
4. **Item-Level Tracking**: Line cooks can mark individual items within a large order as `READY` independently.

---

## 🔗 Related Documentation

- [[architecture]] — Monorepo system architecture and KDS component hierarchy.
- [[database]] — Database schema for `orders` and `order_items` tables.
- [[api]] — Order status update API endpoints reference (`PATCH /api/orders/:id/status`).
- [[authorization]] — Permissions matrix for `kds.view` and `kds.update`.
- [[features/pos-cashier-checkout]] — POS cashier order creation workflow.

