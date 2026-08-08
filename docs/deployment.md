# DinePosAi - Production Deployment & Infrastructure Guide

## 🗺 Deployment Architecture Overview

```mermaid
graph TD
  Client([User / POS Device]) -->|HTTPS| Vercel[Vercel Edge Network - apps/web Next.js]
  Vercel -->|REST API Requests| Railway[Railway / Render - apps/api Express Server]
  Railway -->|PostgreSQL / RLS| Supabase[(Supabase Managed Postgres Database)]
  Railway -->|Billing Webhooks| Stripe[Stripe Payment Gateway]
  Railway -->|AI Concierge| Gemini[Google Gemini AI]
  Railway -->|Emails| Resend[Resend Mail Service]
```

---

## 🗄 1. Database Setup & Migration Procedure (Supabase)

1. Provision a new PostgreSQL instance on [Supabase](https://supabase.com).
2. Obtain your **Database Connection String** (Node.js direct/pooled connection format) under **Project Settings -> Database**:
   ```bash
   export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```
3. Run the automated migration runner from the repository root:
   ```bash
   node scripts/deploy-migrations.js
   ```
   *This script sequentially executes all migration files in `supabase/migrations/` (applying table DDL, RLS policies, indexes, and custom RPC functions).*

---

## ⚡ 2. Deploying the API Backend (`apps/api`)

The Express API backend is containerized using multi-stage Docker builds ([apps/api/Dockerfile](file:///h:/Antigravity/DinePosAi/apps/api/Dockerfile)).

### Recommended Host: Railway or Render

#### Railway Deployment Steps:
1. Connect repository on Railway dashboard.
2. Set Root Directory to `apps/api`.
3. Configure Environment Variables (see [[environment-variables]]):
   - `PORT=4000`
   - `NODE_ENV=production`
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` (comma-separated frontend origins)
4. Generate production domain (e.g. `https://api.dineposai.com`).

---

## 🌐 3. Deploying the Web Frontend (`apps/web`)

The Next.js 16 Web application is optimized for deployment on Vercel.

#### Vercel Deployment Steps:
1. Import repository on [Vercel](https://vercel.com).
2. Set Framework Preset to `Next.js`.
3. Set Root Directory to `apps/web`.
4. Configure Build Command: `pnpm --filter web build`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api.dineposai.com`
   - `NEXT_PUBLIC_SITE_URL=https://dineposai.com`
   - `NEXT_PUBLIC_SENTRY_DSN` (Optional)
   - `NEXT_PUBLIC_POSTHOG_KEY` (Optional)
6. Deploy application.

---

## 🧪 Post-Deployment Verification Smoke Test

1. **Health Check**: Visit `https://api.dineposai.com/health`. Expect HTTP 200 `{ "success": true, "data": { "status": "healthy" } }`.
2. **Onboarding Verification**: Navigate to production web frontend, register a new business account, verify table and user creation in Supabase dashboard.
3. **AI Concierge**: Visit public digital menu (`/menu`), initiate chat with AI Sommelier Aura, verify valid Gemini AI response.
4. **Stripe Webhook Test**: Trigger a test subscription checkout session, confirm Stripe webhook dispatches event to `/api/billing/webhook` and updates `tenants.plan` status to `ACTIVE`.
