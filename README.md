# DinePosAi: Intelligent Restaurant POS & Operating System

DinePosAi is an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) operating system designed for premium hospitality environments. It coordinates front-of-house (FOH) operations, kitchen production tracking, guest self-service interfaces, and corporate platform administration.

---

## 🏛️ Monorepo Architecture

This project is organized as a high-performance **pnpm monorepo**, ensuring code reusability, shared types, and seamless package management:

```
dineposai-monorepo/
├── apps/
│   ├── web/        # Next.js Frontend (POS, KDS, Digital Menu, Super Admin)
│   └── api/        # Express/Node.js REST API Server
├── packages/
│   └── shared-types/ # Shared TypeScript definitions & schemas
├── supabase/       # Database schemas & migrations
└── package.json    # Monorepo configuration & global scripts
```

### 📦 Key Projects

1. **`apps/web` (Frontend Console)**:
   - Built using **Next.js** (App Router) with custom HSL-tailored themes.
   - **Cashier POS Interface**: Speed-optimized checkout and check splitting.
   - **Kitchen Display System (KDS)**: Real-time ticket management and order routing.
   - **Guest Digital Menu**: Elegant self-checkout, table-side ordering, and an interactive **AI Sommelier & Concierge** chat assistant.
   - **Super Admin Console**: SaaS platform administration, tenant onboarding, billing configurations, support helpdesk ticketing, and global system health telemetry.

2. **`apps/api` (Backend Engine)**:
   - Powered by **Express** and **Node.js** with full TypeScript support.
   - Handles multi-tenant authentication, telemetry aggregation, and billing Webhooks.
   - Integrates with **Stripe** for merchant subscription management and **Supabase** for persistence.

3. **`packages/shared-types` (Shared Declarations)**:
   - Centralizes TypeScript interfaces (e.g. `Order`, `MenuItem`, `Tenant`, `User`) ensuring type safety across the network socket boundaries.

---

## 🛠️ Technology Stack

- **Core**: HTML5, TypeScript, Next.js (App Router), Express, Node.js
- **Styling**: TailwindCSS & custom premium HSL Vanilla CSS styles
- **Database / Auth**: Supabase (PostgreSQL, Realtime, GoTrue)
- **Payments**: Stripe Billing API
- **Deployment**: Vercel / Docker / Node clusters

---

## 🚀 Local Development Setup

Follow these steps to run the complete stack locally:

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **pnpm** (v9.x or higher) - *Do not use npm or yarn.*

Install pnpm globally if you don't have it:
```bash
npm install -g pnpm
```

### 2. Dependency Installation
Clone the repository and install all workspace dependencies from the root directory:
```bash
pnpm install
```

### 3. Environment Configuration
Copy the environment template files and populate them with your credentials:

- **For the API server (`apps/api`)**:
  ```bash
  cp apps/api/.env.example apps/api/.env
  ```
  Open `apps/api/.env` and configure your `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `STRIPE_SECRET_KEY`.

- **For the Frontend (`apps/web`)**:
  ```bash
  cp apps/web/.env.example apps/web/.env
  ```
  Open `apps/web/.env` and update the API URL (`NEXT_PUBLIC_API_URL`) and Supabase keys.

### 4. Running the Development Server
Start both the API backend and Next.js frontend concurrently using the global script:
```bash
pnpm dev
```
- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- The backend API will run at [http://localhost:4000](http://localhost:4000)

---

## 🧪 Build and Testing

To compile and verify all workspaces for production:
```bash
pnpm build
```

To run the test suites across all workspaces:
```bash
pnpm test
```

---

## 🔒 Security & Git Policies

- **Environment Files**: The root `.gitignore` is pre-configured to block `.env`, `.env.local`, and any local token variables. Do not remove these rules.
- **Secrets Management**: Never commit hardcoded private keys or service tokens. Always load secrets via `process.env`.
