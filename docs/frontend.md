# DinePosAi - Frontend Architecture & UI Design System

## 🌐 Next.js App Router Architecture

The frontend application ([apps/web](file:///h:/Antigravity/DinePosAi/apps/web)) is built with **Next.js 16 (App Router)** and React 19.

### Route Map & Page Structure

| Route | File Path | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | [app/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/page.tsx) | Public | SaaS Homepage, feature showcase, pricing tables, hero CTA. |
| `/login` | [app/login/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/login/page.tsx) | Public | Multi-role user sign-in screen. |
| `/onboarding` | [app/onboarding/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/onboarding/page.tsx) | Public | Self-serve business registration and venue setup wizard. |
| `/pos` | [app/pos/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/pos/page.tsx) | Protected | Cashier Point-of-Sale terminal with table grid, item selector, bill splitter. |
| `/kds` | [app/kds/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/kds/page.tsx) | Protected | Back-of-House Kitchen Display System with live tickets & audio chime alerts. |
| `/menu` | [app/menu/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/menu/page.tsx) | Public | Table QR digital guest menu with Google Gemini AI Sommelier widget. |
| `/dashboard` | [app/dashboard/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/dashboard/page.tsx) | Protected | Merchant management console (Analytics, Menu CMS, Inventory, Staff, Settings). |
| `/super-admin` | [app/super-admin/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/super-admin/page.tsx) | Protected | Platform administrator console (Tenant roster, system metrics, support desk). |
| `/subscribe` | [app/subscribe/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/subscribe/page.tsx) | Protected | Subscription plan upgrade screen with Stripe Checkout integration. |
| `/profile` | [app/profile/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/profile/page.tsx) | Protected | User account profile, active session management, security logs. |
| `/support` | [app/support/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/support/page.tsx) | Protected | Merchant support ticket submission and tracking helpdesk. |

---

## 🎨 Design System & Custom Tokens

The UI follows a modern dark glassmorphism aesthetic built using custom HSL CSS color variables ([globals.css](file:///h:/Antigravity/DinePosAi/apps/web/app/globals.css)) and Tailwind CSS:

```css
:root {
  --background: 222.2 84% 4.9%;    /* Dark slate blue background */
  --foreground: 210 40% 98%;      /* High-contrast crisp white text */
  --primary: 217.2 91.2% 59.8%;   /* Vibrant indigo accent */
  --accent: 142.1 70.6% 45.3%;    /* Mint emerald green for active states */
  --destructive: 0 84.2% 60.2%;   /* Coral red for destructive warnings */
}
```

### Key UI Characteristics
1. **Glassmorphism Panels**: `backdrop-blur-md bg-slate-900/80 border border-slate-800` styling across modals and cards.
2. **Status Color Badging**:
   - `AVAILABLE` / `ACTIVE`: Emerald green glow.
   - `COOKING` / `PENDING`: Warm amber orange.
   - `OCCUPIED` / `READY`: Vivid cyan blue.
   - `SUSPENDED` / `CANCELLED`: Rose red.
3. **Speed-Optimized Touch Interfaces**: Oversized touch-friendly buttons on the Cashier POS (`/pos`) for quick tapping on touchscreen terminals.

---

## 🔌 React Context Providers & State Management

### 1. `AuthContext` ([authContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/authContext.tsx))
Global state provider maintaining user authentication context across page transitions:
- Manages `token`, `user`, `tenant`, and `isAuthenticated` state.
- Automatically handles token storage in `localStorage`.
- Exposes `login()`, `logout()`, `refreshUser()`, and permission validation helpers (`hasPermission()`).

### 2. `PrinterContext` ([printerContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/printerContext.tsx))
Hardware integration state provider:
- Stores connected ESC/POS thermal printer IP addresses and ports (default TCP port 9100).
- Exposes receipt printing methods (`printReceipt()`, `kickCashDrawer()`).
- Formats ESC/POS raw byte buffers via [escposEncoder.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/escposEncoder.ts) and dispatches socket requests to [printerService.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/printerService.ts).

---

## 🛡 Security & Gate Components

### 1. `AuthGuard` ([AuthGuard.tsx](file:///h:/Antigravity/DinePosAi/apps/web/src/components/guards/AuthGuard.tsx))
HOC wrapper verifying token validity before rendering protected screens:
- Inspects `isAuthenticated` state.
- Verifies user's role against optional `allowedRoles` array.
- Redirects unauthorized users to `/login`.

### 2. `TrialGate` ([TrialGate.tsx](file:///h:/Antigravity/DinePosAi/apps/web/src/components/TrialGate.tsx))
Subscription lifecycle enforcer:
- Evaluates tenant plan status (`TRIAL`, `ACTIVE`, `PAST_DUE`, `EXPIRED`).
- Displays non-dismissible banner overlay if trial has expired (`trial_ends_at < NOW()`).
- Restricts non-paying tenants from creating new orders or managing inventory until plan is renewed.
