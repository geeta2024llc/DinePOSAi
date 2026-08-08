# DinePosAi - Authentication Architecture

## 🔐 Overview

DinePosAi implements a hybrid **JWT + Stateful Session Verification** architecture.

- **Frontend Token Storage**: JWT access token stored in browser `localStorage` under `dinepos_token`.
- **Token Format**: HS256 signed JSON Web Token (JWT) containing user ID, tenant ID, role, email, and session ID.
- **Backend Session Verification**: Every incoming authenticated request verifies the active session against the `user_sessions` database table, enforcing instant token revocation capabilities.
- **Session Caching**: To prevent database bottlenecks caused by high-frequency POS/KDS polling, backend middleware implements an in-memory session cache with a 5-second TTL.

---

## 🔑 Authentication Tokens & Claims

JWT tokens are signed by the backend Express server using `JWT_SECRET` ([auth.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/auth.controller.ts)).

### JWT Token Payload Schema
```json
{
  "id": "u472f88a-912b-42e1-8899-0123456789ab",
  "tenantId": "t1112223-4444-5555-6666-777788889999",
  "role": "MANAGER",
  "email": "manager@restaurant.com",
  "sessionId": "s8888888-9999-0000-1111-222233334444",
  "iat": 1775000000,
  "exp": 1775086400
}
```

---

## 🔄 Authentication Flows

### 1. User Sign-in Flow (`POST /api/auth/login`)
```
[User Submits Email & Password]
       │
       ▼
 1. Rate Limiting (authLimiter: max 5 requests / 15 mins in production)
       │
       ▼
 2. Zod Schema Validation (loginSchema)
       │
       ▼
 3. Database Lookup (Fetches user from `users` table)
       │
       ▼
 4. Password Verification (Verifies hash or Supabase GoTrue credentials)
       │
       ▼
 5. Organization Check (Verifies user's tenant account is ACTIVE)
       │
       ▼
 6. Session Creation (Inserts new record into `user_sessions` table with device/IP info)
       │
       ▼
 7. Login Audit (Inserts record into `login_history` with status 'SUCCESS')
       │
       ▼
 8. JWT Generation (Signs access token & refresh token)
       │
       ▼
 9. Response Delivery (Returns user object, JWT token, and sets refreshToken cookie)
```

### 2. Token Refresh Flow (`POST /api/auth/refresh`)
- Frontend detects expired token or sends stored `refreshToken`.
- Endpoint queries `user_sessions` matching `refresh_token`.
- Validates session expiry (`expires_at > NOW()`).
- Issues new JWT access token and updates `last_activity` in `user_sessions`.

### 3. Session Revocation & Logout
- **Single Logout (`POST /api/auth/logout`)**: Marks `logout_time = NOW()` and deletes session from `user_sessions`. Clears local cache.
- **Global Logout (`POST /api/auth/logout-all`)**: Deletes ALL active sessions for the user in `user_sessions`, invalidating all devices simultaneously.
- **Individual Session Revocation (`DELETE /api/auth/sessions/:id`)**: Allows users to terminate specific active logins from [/profile](file:///h:/Antigravity/DinePosAi/apps/web/app/profile/page.tsx).

---

## ⚡ Session Memory Caching Layer

High-frequency client screens (e.g. Cashier POS updating every few seconds or KDS polling active orders) send hundreds of authenticated requests per minute.

To prevent database saturation, `authenticateUser` ([auth.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/auth.ts)) manages an in-memory cache:

```typescript
const authCache = new Map<string, CachedAuth>();
const CACHE_TTL_MS = 5000; // 5-second TTL
```

- Cache key format: `${userId}:${sessionId}:${role}`.
- If cached entry exists and `expiresAt > NOW()`, database lookup is skipped.
- Cache expires after 5 seconds, ensuring revoked sessions take effect within 5 seconds maximum across the network.

---

## 🔒 Security Best Practices Implemented

- **Password Rules**: Minimum 8 characters required on sign-up; validated via Zod schema.
- **Login Brute-Force Defense**: `authLimiter` restricts login attempts per IP.
- **Sensitive Data Masking**: Automated audit logger ([audit.middleware.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/middleware/audit.middleware.ts)) redacts `password`, `token`, `refreshToken`, and `currentPassword` fields before persisting audit logs.
- **Session Telemetry**: Records client IP address, device type, browser engine, operating system, and geolocation city/country for security auditing.
