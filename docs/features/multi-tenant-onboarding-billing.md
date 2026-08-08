# Feature Specification: Multi-Tenant Onboarding & Billing

## 🏢 Feature Overview

The **Multi-Tenant Onboarding & Billing Module** handles self-serve merchant account creation, trial management, multi-branch expansion, and Stripe subscription monetization.

---

## 🏛 Key Implementation Touchpoints

- **Onboarding Page**: [app/onboarding/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/onboarding/page.tsx)
- **Subscribe Page**: [app/subscribe/page.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/subscribe/page.tsx)
- **Tenant Controller**: [tenant.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/tenant.controller.ts)
- **Billing Controller**: [billing.controller.ts](file:///h:/Antigravity/DinePosAi/apps/api/src/controllers/billing.controller.ts)

---

## 🔄 Subscription Lifecycle States

1. **Free Trial (`TRIAL`)**: New tenants receive a 14-day free trial on signup.
2. **Active Subscription (`ACTIVE`)**: User upgrades to paid tier via Stripe Checkout.
3. **Past Due (`PAST_DUE`)**: Failed recurring invoice payment.
4. **Trial Expired (`EXPIRED`)**: Trial duration elapsed without upgrading. Triggered overlay banner via `TrialGate.tsx`.
5. **Suspended (`SUSPENDED`)**: Account manually suspended by Super Admin.
