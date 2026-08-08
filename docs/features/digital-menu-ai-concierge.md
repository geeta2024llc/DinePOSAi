# Feature Specification: Digital Guest Menu & AI Concierge

## 📱 Feature Overview

The **Digital Guest Menu** ([apps/web/app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx)) allows restaurant guests sitting at dining tables to scan a QR code (`/menu?tenantId=...&tableId=...`), browse live menu items, inspect ingredient descriptions, and chat with **Aura**, an interactive AI Sommelier & Culinary Concierge powered by Google Gemini.

---

## 🏛 Key Implementation Touchpoints

- **Public Menu Endpoint**: `GET /api/menu/public` ([menu.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/menu.controller.ts))
- **AI Chat Endpoint**: `POST /api/concierge/chat` ([concierge.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/concierge.controller.ts))
- **Frontend View**: [app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx)

---

## 🤖 AI Sommelier (Aura) Capabilities

1. **Menu Contextual Awareness**: Aura is initialized with the venue's active categories, menu items, prices, and descriptions.
2. **Food & Wine Pairing**: Answers guest queries such as *"Which dessert pairs best with an espresso?"* or *"Are there any gluten-free appetizers?"*.
3. **No Authentication Required**: Guests can use the AI assistant and browse menus without logging in.
