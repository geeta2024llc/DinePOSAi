# Common Code Patterns in DinePosAi

## 🔁 Recurring Architecture & Coding Patterns

### 1. Express Router & Middleware Chaining
```typescript
router.use(requireAuth);                     // 1. Authenticate JWT token
router.use(validateOrganizationActive);      // 2. Verify active tenant status
router.use(requireOrganizationMatch);        // 3. Verify tenant isolation

router.post(
  '/', 
  requirePermission('orders.create'),        // 4. Enforce RBAC permission
  validateSchema(createOrderSchema),          // 5. Validate input body
  auditLogger('Place Order', 'order'),        // 6. Post-response audit log
  createOrder                                 // 7. Controller logic
);
```

### 2. In-Memory Auth Caching Pattern
```typescript
// Memory cache key format
const cacheKey = `${decoded.id}:${decoded.sessionId}:${decoded.role}`;
const cached = authCache.get(cacheKey);

if (cached && cached.expiresAt > new Date()) {
  session = cached.session;
  permissions = cached.permissions;
} else {
  // Query Supabase database & update authCache with 5000ms TTL
}
```

### 3. Glassmorphism UI Card Styling
```tsx
<div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
  {/* Card Content */}
</div>
```

---

## 🔗 Related Documentation

- [[architecture]] — End-to-end request security pipeline.
- [[backend]] — Express server pipeline and middleware execution chain.
- [[frontend]] — Web frontend App Router component patterns and HSL design tokens.
- [[database]] — Database query execution via Supabase RPCs.

