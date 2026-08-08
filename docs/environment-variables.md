# DinePosAi - Environment Variables Specification

## ⚙ Express API Backend Variables (`apps/api/.env`)

| Variable Name | Required | Default / Example | Description | Security Classification |
|---------------|:--------:|-------------------|-------------|------------------------|
| `PORT` | No | `4000` | Port for Express API server listening socket. | Public |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`). | Public |
| `JWT_SECRET` | **CRITICAL** | High-entropy string | Key for signing and verifying JWT tokens (Min 32 chars). | **SECRET** |
| `SUPABASE_URL` | **CRITICAL** | `https://xxxx.supabase.co` | Base URL endpoint for Supabase project instance. | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **CRITICAL** | `eyJhbGci...` | Supabase service role key bypassing RLS. | **SECRET (NEVER EXPOSE)** |
| `STRIPE_SECRET_KEY` | Optional in Dev | `sk_live_...` or `sk_test_...` | Stripe payment secret key. | **SECRET** |
| `STRIPE_WEBHOOK_SECRET` | Optional in Dev | `whsec_...` | Signing key for validating incoming Stripe webhook events. | **SECRET** |
| `RESEND_API_KEY` | Optional in Dev | `re_...` | API key for Resend email dispatch. | **SECRET** |
| `SENDER_EMAIL_DOMAIN` | No | `noreply.dineposai.com` | Sending domain header for outbound transactional emails. | Public |
| `GEMINI_API_KEY` | Optional in Dev | Gemini API Token | Google Gemini key for AI Sommelier concierge responses. | **SECRET** |
| `FRONTEND_URL` | Prod Only | `http://localhost:3000` | Comma-separated list of allowed CORS origins. | Public |
| `POSTHOG_API_KEY` | No | `phc_...` | PostHog server-side analytics API key. | Public |
| `POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog ingestion host endpoint. | Public |
| `EMAIL_ENUMERATION_PROTECTION` | No | `false` | When true, login/reset returns generic responses to prevent user enumeration. | Public |
| `SENTRY_DSN` | No | `https://xxxx@sentry.io/xxxx` | Backend Node.js Sentry error tracking endpoint. | Public |

---

## 🌐 Next.js Web Frontend Variables (`apps/web/.env`)

> [!IMPORTANT]
> All variables exposed to the client browser MUST be prefixed with `NEXT_PUBLIC_`. Never put private secret keys in the web environment file.

| Variable Name | Required | Default / Example | Description |
|---------------|:--------:|-------------------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:4000` | URL pointing to deployed Express API backend server. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://xxxx.supabase.co` | Supabase project URL endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | `eyJhbGci...` | Supabase anonymous public key for client calls. |
| `NEXT_PUBLIC_SITE_URL` | No | `https://dineposai.com` | Production canonical web URL for SEO & sitemap generation. |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | `phc_...` | Client-side PostHog product analytics tracking key. |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://us.i.posthog.com` | Client-side PostHog ingestion host. |
| `NEXT_PUBLIC_SENTRY_DSN` | No | `https://xxxx@sentry.io/xxxx` | Client-side Next.js Sentry error tracking endpoint. |
