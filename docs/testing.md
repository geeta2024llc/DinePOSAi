# DinePosAi - Testing & Quality Assurance Manual

## 🧪 Testing Infrastructure Overview

DinePosAi combines monorepo package test commands with standalone integration test scripts located in [apps/api](file:///h:/Antigravity/DinePosAi/apps/api).

### Monorepo Test Commands

To execute tests across all workspace packages from the monorepo root:

```bash
pnpm test
```

*This command triggers `pnpm --filter "*" test`, running package-specific test suites in parallel.*

---

## 🔬 Integration Test Suite Scripts (`apps/api`)

The backend repository includes dedicated integration test runners written in JavaScript for verifying API endpoints and database operations:

| Test Script File | Purpose & Verification Scope | Execution Command |
|------------------|------------------------------|-------------------|
| [test_health.js](file:///h:/Antigravity/DinePosAi/apps/api/test_health.js) | Verifies unauthenticated `/health` endpoint response and system uptime. | `node test_health.js` |
| [test_login_api.js](file:///h:/Antigravity/DinePosAi/apps/api/test_login_api.js) | Tests JWT authentication, credential validation, and session generation. | `node test_login_api.js` |
| [test_login_supabase.js](file:///h:/Antigravity/DinePosAi/apps/api/test_login_supabase.js) | Verifies Supabase authentication client integration. | `node test_login_supabase.js` |
| [test_signup_api.js](file:///h:/Antigravity/DinePosAi/apps/api/test_signup_api.js) | Tests user signup and automatic tenant workspace instantiation. | `node test_signup_api.js` |
| [test_public_menu_api.js](file:///h:/Antigravity/DinePosAi/apps/api/test_public_menu_api.js) | Tests unauthenticated public QR digital menu fetch (`GET /api/menu/public`). | `node test_public_menu_api.js` |
| [test_auth_admin.js](file:///h:/Antigravity/DinePosAi/apps/api/test_auth_admin.js) | Tests Super Admin login and elevated permission endpoints (`/api/admin/*`). | `node test_auth_admin.js` |
| [test_delete_tenant_verification.js](file:///h:/Antigravity/DinePosAi/apps/api/test_delete_tenant_verification.js) | Verifies cascading deletion of tenant records across all child tables. | `node test_delete_tenant_verification.js` |
| [test_bulk_delete_tenants.js](file:///h:/Antigravity/DinePosAi/apps/api/test_bulk_delete_tenants.js) | Tests bulk tenant cleanup endpoint (`POST /api/admin/tenants/bulk-delete`). | `node test_bulk_delete_tenants.js` |
| [test_custom_id.js](file:///h:/Antigravity/DinePosAi/apps/api/test_custom_id.js) | Validates UUID generation and custom entity identifier formatting. | `node test_custom_id.js` |
| [check_db.js](file:///h:/Antigravity/DinePosAi/apps/api/check_db.js) | Smoke test verifying direct database pool connection to Supabase Postgres. | `node check_db.js` |

---

## 📋 Recommended Pre-Commit Verification Workflow

Before submitting pull requests or making modifications to API routes:

1. **Verify Workspace Types & Compilation**:
   ```bash
   pnpm build
   ```
2. **Execute Local Health & Auth Smoke Tests**:
   ```bash
   cd apps/api
   node test_health.js
   node test_login_api.js
   ```
3. **Execute Full Workspace Test Filter**:
   ```bash
   pnpm test
   ```

---

## 🔗 Related Documentation

- [[architecture]] — Monorepo system architecture and Express request pipeline.
- [[backend]] — Express REST API engine, controller methods, and route definitions.
- [[api]] — API endpoints reference manual for test payload schemas.
- [[database]] — Database schema directory for verification query expectations.

