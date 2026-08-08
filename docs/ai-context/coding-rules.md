# AI Coding Rules & Conventions

## 📏 General Rules for AI Coding Agents

1. **Do Not Modify Application Code Without Approval**: Never refactor working endpoints, rewrite styling systems, or alter database schemas unless explicitly requested.
2. **Preserve Type Contracts**: Always import shared types from `@dineposai/shared-types`. Never re-declare models locally in `apps/api` or `apps/web`.
3. **Multi-Tenancy Requirement**: Every database operation MUST filter by `tenant_id`. Every API route modifying tenant data MUST use `requireOrganizationMatch`.
4. **Unified API Envelope**: Express endpoints MUST return responses adhering to `ApiResponse<T>`:
   ```typescript
   // Success response
   res.json({ success: true, data: result });
   // Error response
   res.status(400).json({ success: false, error: 'Error message' });
   ```
5. **No Hardcoded Secrets**: Secrets MUST be read from `process.env`. Never commit hardcoded JWT secrets, Stripe tokens, or service role keys.
6. **Zod Input Validation**: Validate incoming `req.body` using Zod schemas via `validateSchema()` middleware before executing controller handlers.
7. **Use pnpm Monorepo Tooling**: Always execute package commands using `pnpm`. Do not use `npm` or `yarn`.

---

## 🔗 Related Documentation

- [[architecture]] — Monorepo package architecture and request security pipeline.
- [[api]] — API envelope standard (`ApiResponse<T>`) and endpoint reference.
- [[frontend]] — Frontend component conventions and HSL design system.
- [[backend]] — Express server controller conventions and Zod validation middleware.

