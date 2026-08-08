# Known Limitations & Technical Debt

## ⚠️ Known Limitations & Architectural Risks

1. **In-Memory Session Cache Scope**: The session cache `authCache` in [auth.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/auth.ts) is stored in Node process memory. If the API is horizontally scaled across multiple instances without sticky sessions or Redis, session revocations may take up to 5 seconds to propagate across all cluster workers.
2. **Browser Thermal Printer TCP Socket Restriction**: Pure web browsers do not allow raw TCP socket connections on port 9100 for security reasons. Hardware printing relies on fallback browser HTML window printing unless running in an Electron/native wrapper.
3. **Stripe Test Keys Warning**: Production deployments log warnings if `STRIPE_SECRET_KEY` uses test keys (`sk_test_...`) or if `JWT_SECRET` is under 32 characters.
4. **Offline Mode Limitations**: POS checkout requires active server connectivity to process transactions and deduct inventory stock. Fully offline local SQLite caching is not currently implemented.

---

## 🔗 Related Documentation

- [[architecture]] — Monorepo system architecture and network security bounds.
- [[backend]] — Express API server engine, session cache TTL, and error tracking.
- [[integrations]] — Technical details for Stripe billing and ESC/POS thermal printing limitations.

