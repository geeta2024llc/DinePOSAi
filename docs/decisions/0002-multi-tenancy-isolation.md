# Architectural Decision Record (ADR) 0002: Multi-Tenancy Isolation Strategy

## 📅 Status
**Accepted**

## 💡 Context
The SaaS architecture requires isolating data across restaurant venues while maintaining low database operation costs and high query performance.

## 🎯 Decision
Adopt a **shared-database, column-level multi-tenancy model** using PostgreSQL. Every table contains a `tenant_id UUID` column. Isolation is enforced through dual layers:
1. **Database Layer**: Supabase Row-Level Security (RLS) policies.
2. **Application Layer**: Express middleware (`requireOrganizationMatch`) validating incoming request tenant IDs against user JWT session claims.

## ⚡ Consequences
- **Positive**: Low infrastructure cost compared to multi-database-per-tenant designs. Single schema migration deployable across all tenants.
- **Positive**: High security due to dual-layer enforcement (Middleware + RLS).
- **Negative**: All queries MUST include `tenant_id` filter conditions to leverage database indexes effectively.

---

## 🔗 Related Documentation

- [[architecture]] — Express middleware security pipeline (`requireOrganizationMatch`).
- [[database]] — Table schema for `tenants` and database RLS policy definitions.
- [[authorization]] — Organization matching and tenant status validation guards.
- [[features/multi-tenant-onboarding-billing]] — Feature spec for tenant account creation and subscription lifecycle.

