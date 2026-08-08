# DinePosAi - Third-Party Integrations Reference

## 💳 1. Stripe Payment Gateway & Billing

DinePosAi integrates with Stripe for merchant subscription billing and SaaS monetization.

- **SDK**: `stripe ^15.7.0`
- **Controller**: [billing.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/billing.controller.ts)
- **Environment Variables**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Integration Capabilities
1. **Stripe Checkout Sessions**: Generates recurring subscription checkout sessions (`stripe.checkout.sessions.create`) for restaurant tenants upgrading to paid plans (`GROWTH`, `ENTERPRISE`).
2. **Customer Portal**: Generates billing portal sessions (`stripe.billingPortal.sessions.create`) allowing owners to manage payment methods and download invoices.
3. **Webhook Verification**: Listens for asynchronous Stripe webhooks (`/api/billing/webhook`) using raw body signatures (`stripe.webhooks.constructEvent(req.rawBody, sig, secret)`).
4. **Handled Webhook Events**:
   - `checkout.session.completed`: Upgrades tenant plan status to `ACTIVE`.
   - `invoice.payment_succeeded`: Extends subscription period.
   - `invoice.payment_failed`: Marks tenant plan status as `PAST_DUE`.
   - `customer.subscription.deleted`: Sets tenant status to `EXPIRED`.

---

## 🤖 2. Google Gemini AI (Sommelier & Concierge)

An interactive AI Sommelier chatbot available on the public guest digital menu (`/menu`).

- **Endpoint**: `POST /api/concierge/chat`
- **Controller**: [concierge.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/concierge.controller.ts)
- **Model**: `gemini-1.5-flash`
- **Environment Variable**: `GEMINI_API_KEY`

### Integration Architecture
- Endpoint accepts guest prompts along with context parameters (`tenantId`, `tableId`).
- Controller queries active `menu_items` and `categories` for the specific tenant.
- Constructs a structured system prompt instantiating **Aura, the AI Sommelier & Culinary Concierge**:
  - Contextualizes food pairing suggestions based *only* on the restaurant's actual active dishes.
  - Formats currency prices using the venue's default currency.
  - Ensures helpful, professional response formatting.

---

## 📧 3. Resend Email Service

Transactional email delivery service for user invitations, password resets, and digital receipts.

- **Integration Mode**: Direct REST API call via `fetch`
- **Endpoint**: `https://api.resend.com/emails`
- **Environment Variable**: `RESEND_API_KEY`

### Email Triggers
- **Welcome & Onboarding**: Dispatched when a new tenant registers an account.
- **Password Reset**: Delivers secure password reset links containing verification tokens.
- **Digital Receipt**: Sends PDF receipt copy to customer email upon checkout completion.

---

## 🖨 4. ESC/POS Thermal Printing

Direct hardware printing capability for kitchen tickets and customer receipts.

- **Files**: [printerService.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/printerService.ts), [escposEncoder.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/escposEncoder.ts)
- **Protocol**: Raw TCP byte streaming over port 9100.

### Integration Mechanism
- [escposEncoder.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/escposEncoder.ts) constructs binary buffer commands (`0x1B`, `0x40` initialization, `0x1D`, `0x56` paper cut, `0x1B`, `0x70` cash drawer pulse).
- [printerService.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/printerService.ts) attempts direct network socket connection to thermal printer IP addresses on the local network.
- **Fallback**: If network TCP connection fails or browser environment blocks raw socket connections, triggers fallback browser HTML print window (`window.print()`).

---

## 📊 5. Sentry Error Tracking & PostHog Analytics

### Sentry Error Tracking
- **Backend SDK**: `@sentry/node` initialized in [server.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/server.ts).
- **Frontend SDK**: `@sentry/nextjs` initialized in [instrumentation-client.ts](file:///h:/Antigravity/DinePosAi/apps/web/instrumentation-client.ts).
- Automatically captures unhandled exceptions, route failures, and database connection errors.

### PostHog Product Analytics
- **Frontend SDK**: `posthog-js` initialized in Next.js providers tree ([providers.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/providers.tsx)).
- Tracks user feature interactions, pageviews, and cashier checkout latency.
