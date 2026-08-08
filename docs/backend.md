# DinePosAi - Backend Engine Architecture

## ⚡ Server Entrypoint & Process Management

The backend API server ([apps/api/src/server.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/server.ts)) is built on Node.js and Express.

### Pre-Flight Environment Validation
On server initialization, the script verifies required environment variables (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL` in production). If any required variable is missing, the server logs a fatal error and terminates immediately (`process.exit(1)`).

### Signal Handling & Graceful Shutdown
The server tracks active TCP socket connections (`openSockets = new Set<Socket>()`). When a termination signal (`SIGTERM`, `SIGINT`) or uncaught exception occurs:
1. `gracefulShutdown()` is invoked.
2. Destroys all open sockets immediately to release TCP port 4000.
3. Closes HTTP server instance cleanly.
4. Enforces a 2-second fallback timeout in development mode to enable instant hot-reloading with `tsx watch`.

---

## 🔒 Security Headers & CORS Policy

### Dynamic Origin CORS Matching
CORS origins are configured dynamically from `process.env.FRONTEND_URL`:
- Supports comma-separated origin lists (e.g. `https://dineposai.com,https://www.dineposai.com`).
- In non-production environments, standard local development origins matching localhost, 127.0.0.1, or private LAN IPs (`192.168.x.x`, `10.x.x.x`) are automatically permitted.

### Security Response Headers
Configured via `setSecurityHeaders` ([security.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/security.js)):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## ⏱ Rate Limiting Policy

Rate limiting is enforced using `express-rate-limit`:

| Limiter | Scope | Window | Max Requests (Prod) | Max Requests (Dev) |
|---------|-------|--------|---------------------|--------------------|
| `globalLimiter` | All `/api/*` routes | 15 mins | 100 | 10,000 |
| `authLimiter` | `/api/auth/*` routes | 15 mins | 5 | 100 |
| `conciergeLimiter` | `/api/concierge/*` routes | 1 min | 5 | 60 |

---

## 📝 Logging & Observability

- **Structured JSON Logging**: Powered by `pino` and `pino-http` ([logger.js](file:///h:/Antigravity/DinePosAi/apps/api/src/utils/logger.js)).
- **Health Check Exclusion**: Requests to `/health` are ignored by `autoLogging` to avoid polluting server logs.
- **Sentry Exception Reporting**: Captures unhandled error stack traces in production when `SENTRY_DSN` is set.

---

## 🗂 Controller Directory Architecture

Backend business logic is isolated into 10 domain controllers ([apps/api/src/controllers](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers)):

1. `auth.controller.ts`: Handles registration, login, JWT issuance, session management, and password resets.
2. `tenant.controller.ts`: Manages restaurant onboarding, tenant settings updates, and staff accounts.
3. `table.controller.ts`: Controls floor plan tables, status transitions, and seating capacity.
4. `menu.controller.ts`: Controls categories, menu items, variants, add-ons, and public QR menu views.
5. `inventory.controller.ts`: Manages stock levels, recipe links, waste logs, suppliers, and purchase orders.
6. `order.controller.ts`: Processes POS order creation, kitchen ticket queue updates, and item status progression.
7. `concierge.controller.ts`: Interfaces with Google Gemini REST API for food and wine recommendations.
8. `billing.controller.ts`: Handles Stripe Checkout sessions, billing portal links, and Stripe webhooks.
9. `audit.controller.ts`: Fetches auditable activity streams for security reviews.
10. `admin.controller.ts`: Platform management endpoints for Super Admins (tenant suspension, MRR analytics, bulk deletion).

---

## 🔗 Related Documentation

- [[architecture]] — Backend server pipeline diagram and Express security flow.
- [[api]] — Complete REST API reference manual covering all controller endpoints.
- [[authentication]] — JWT verification, password hashing, and session memory cache (`authCache`).
- [[authorization]] — Granular permission guards (`requirePermission`) and multi-tenant isolation (`requireOrganizationMatch`).
- [[database]] — Supabase PostgreSQL schema, RLS policies, and stored RPC functions.
- [[integrations]] — Third-party SDK integrations (Stripe, Google Gemini AI, Resend Email).

