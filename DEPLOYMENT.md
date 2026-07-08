# DinePOS AI Production Deployment Guide

This document outlines the step-by-step process to deploy the DinePOS AI multi-tenant platform to production environments.

---

## 🗺️ Deployment Architecture

```mermaid
graph TD
  User([Restaurant Guest / Staff]) -->|HTTPS| Web[Next.js Web Frontend - Vercel]
  Web -->|Proxy API Requests| API[Express API Backend - Railway/Render]
  API -->|REST / RPC API| DB[(Supabase PostgreSQL Database)]
  API -->|Payment Processing| Stripe[Stripe Payment Gateway]
  API -->|Transactional Emails| Resend[Resend Mail Service]
  API -->|AI Assistant| Gemini[Google Gemini AI]
  Web -->|Analytics| PostHog[PostHog Platform]
  Web -->|Error Tracking| SentryClient[Sentry Client Tracking]
  API -->|Error Tracking| SentryServer[Sentry Server Tracking]
```

---

## 1. 🗄️ Database Setup (Supabase)

1. Sign in to [Supabase](https://supabase.com) and click **New Project**.
2. Select your Organization, enter a project Name (e.g. `DinePOS AI`), set a secure database Password, and select the region closest to your customers.
3. Once the database is provisioned, go to **Project Settings** -> **Database** and copy your **URI Connection String** under "Connection string" (select the Node/Direct connection or Transaction connection pooling tab).
   - Format: `postgresql://postgres.[username]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
4. Set this Connection String in your shell:
   ```bash
   export DATABASE_URL="your-supabase-connection-string"
   ```
5. Run the migration script from the repository root to apply all tables, triggers, indexes, and custom atomic transaction RPC functions:
   ```bash
   node scripts/deploy-migrations.js
   ```

---

## 2. 🔑 Environment Variables Checklist

Ensure these variables are added to your hosting environments:

### Express API Backend (`apps/api`)

| Name | Description | Example |
|------|-------------|---------|
| `PORT` | Listening Port | `4000` |
| `NODE_ENV` | Environment Type | `production` |
| `JWT_SECRET` | HS256 secret for signing auth tokens (minimum 32 characters) | *High-entropy random key* |
| `SUPABASE_URL` | Supabase endpoint URL | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (permits RLS bypass) | `eyJhbGciOi...` |
| `STRIPE_SECRET_KEY` | Stripe Production Secret Key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_...` |
| `RESEND_API_KEY` | Resend API Key | `re_...` |
| `GEMINI_API_KEY` | Google Gemini AI Key | *Gemini Key* |
| `FRONTEND_URL` | Comma-separated list of allowed CORS Origins | `https://dineposai.com,https://www.dineposai.com` |
| `SENTRY_DSN` | Sentry Node project DSN (Optional) | `https://xxxx@o1234.ingest.sentry.io/xxxx` |

### Next.js Web Frontend (`apps/web`)

| Name | Description | Example |
|------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL pointing to the deployed Express API backend | `https://api.dineposai.com` |
| `NEXT_PUBLIC_SITE_URL` | URL pointing to the deployed web application (for SEO/Sitemap generation) | `https://dineposai.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Next.js project DSN (Optional) | `https://xxxx@o1234.ingest.sentry.io/xxxx` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Client API key (Optional) | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog endpoint host (Optional) | `https://us.i.posthog.com` |

---

## 3. 🚀 Deploy the API Backend (Railway or Render)

The backend is configured to support Docker builds out-of-the-box using [apps/api/Dockerfile](file:///h:/Antigravity/DinePosAi/apps/api/Dockerfile).

### Deploying to Railway
1. Go to [Railway](https://railway.app) and sign in.
2. Click **New Project** -> **Deploy from GitHub repo** -> Select this repository.
3. Under the Service Settings:
   - Set the Root Directory to `apps/api`.
   - Railway will automatically detect the `Dockerfile` inside the root directory and use it to build.
4. Add all environment variables listed in the checklist above.
5. In the settings tab, click **Generate Domain** or map your custom domain (e.g. `api.dineposai.com`).

---

## 4. 🌐 Deploy the Web Frontend (Vercel)

Vercel is the recommended hosting platform for Next.js applications.

### Deploying to Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm --filter web build`
   - **Install Command**: `pnpm install`
4. Add all environment variables listed in the checklist above.
5. Click **Deploy**.
6. Once deployed, configure your custom domain under the project settings.

---

## 🧪 Post-Deployment Sanity Verification

Follow this smoke-test checklist after deploying to verify everything is operational:

1. **Health Check**: Visit `https://<your-api-url>/health` to confirm the backend is up and running.
2. **Onboarding & Auth Flow**:
   - Go to your production frontend URL and register a new business account.
   - Confirm you receive the onboarding success screen and can access the dashboard.
3. **Database Checks**:
   - Log in to Supabase and verify that rows were inserted into the `tenants` and `users` tables.
4. **Stripe Integration**:
   - Place a digital menu order or try to purchase a premium subscription.
   - Confirm redirection to the Stripe checkout session.
5. **AI Concierge**:
   - Visit the Digital Guest Menu (`/menu`) and try talking to the AI assistant.
   - Ensure the AI Concierge correctly answers queries regarding dishes and pricing.
6. **Telemetry & Logs**:
   - Check the Sentry dashboard for any unhandled edge exceptions.
   - Verify PostHog is receiving client interaction and pageview telemetry.
