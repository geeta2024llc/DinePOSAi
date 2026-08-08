# DinePosAi - Troubleshooting & Diagnostic Guide

## 🚨 Common Development & Production Issues

### 1. Database Connection & Migration Failures
**Symptom**: `FATAL: JWT_SECRET environment variable is not set` or database query timeouts.
- **Cause**: Missing environment variables in `apps/api/.env` or incorrect Supabase connection string.
- **Diagnostic Steps**:
  1. Inspect `apps/api/.env` and ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present.
  2. Run the database connectivity script:
     ```bash
     node apps/api/check_db.js
     ```
  3. Re-run migration script if tables are missing:
     ```bash
     node scripts/deploy-migrations.js
     ```

---

### 2. Stripe Webhook Signature Verification Failures
**Symptom**: `400 Bad Request: Webhook Error: No signature found` on `/api/billing/webhook`.
- **Cause**: Body parser converted incoming webhook payload to a parsed JavaScript object instead of retaining the raw Buffer required by `stripe.webhooks.constructEvent`.
- **Resolution**:
  - Verify `server.ts` includes the raw body verification hook:
    ```typescript
    app.use(express.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl && req.originalUrl.includes('/billing/webhook')) {
          req.rawBody = buf;
        }
      }
    }));
    ```
  - Ensure `STRIPE_WEBHOOK_SECRET` in `apps/api/.env` matches the secret key provided by Stripe CLI or Stripe Dashboard.

---

### 3. Thermal Receipt Printing Socket Failures
**Symptom**: Cashier POS displays `Printer Offline` or thermal receipt fails to print.
- **Cause**: Network TCP socket blocked by browser CORS restrictions, or printer IP address unreachable on port 9100.
- **Resolution**:
  1. Verify thermal printer is powered on and assigned a static IP address on the local network (e.g. `192.168.1.200`).
  2. Test network connectivity from terminal: `ping 192.168.1.200`.
  3. Note: Web browsers restrict direct raw TCP socket connections (`net.Socket`). In web-only browser deployments, the application automatically falls back to standard HTML window printing (`window.print()`).

---

### 4. CORS Blocked Origin Errors
**Symptom**: `CORS blocked origin: http://localhost:3000` in server console logs.
- **Cause**: Frontend origin URL not present in `FRONTEND_URL` environment variable.
- **Resolution**:
  - Update `apps/api/.env`:
    ```env
    FRONTEND_URL=http://localhost:3000,http://127.0.0.1:3000
    ```
  - Restart API server process.

---

### 5. Rate Limit Lockout (HTTP 429 Too Many Requests)
**Symptom**: `Too many requests from this IP. Please try again later.`
- **Cause**: Exceeded IP rate limit on `/api/auth` or `/api/concierge`.
- **Resolution**:
  - In development mode (`NODE_ENV=development`), rate limiters permit higher request caps (e.g. 10,000 global requests). Ensure `NODE_ENV` is set to `development` during local testing.
