# DinePosAi - Workspace Folder Structure Map

## 📂 Root Monorepo Directory

```
h:/Antigravity/DinePosAi/
├── apps/                        # Main web applications & API services
│   ├── api/                     # Express REST API backend server
│   └── web/                     # Next.js 16 App Router web application
├── packages/                    # Internal monorepo packages
│   └── shared-types/            # Shared TypeScript types & permission schemas
├── supabase/                    # Supabase database schema & migrations
│   ├── migrations/              # SQL schema migration files
│   ├── combined_migrations.sql  # Concatenated migration bundle
│   └── schema_rls_policies.sql  # Database Row-Level Security policy declarations
├── scripts/                     # Operational utility scripts
│   ├── deploy-migrations.js     # Script to execute database migrations against Supabase
│   └── test-connection.js       # Database connectivity smoke test
├── .gitignore                   # Workspace git exclusion rules
├── DEPLOYMENT.md                # Multi-environment deployment guide
├── LICENSE                      # Software license
├── package.json                 # Monorepo root script configuration
├── pnpm-lock.yaml               # Lockfile for pnpm dependencies
├── pnpm-workspace.yaml          # Monorepo workspace membership definition
├── README.md                    # Project landing page
└── tsconfig.json                # Global TypeScript base configuration
```

---

## 🌐 Next.js Web Application (`apps/web`)

```
apps/web/
├── app/                         # Next.js App Router Page Directory
│   ├── dashboard/               # Merchant Analytics & Operations Dashboard
│   ├── demo/                    # Demo Mode Interface
│   ├── forgot-password/         # Self-service Password Reset Request Page
│   ├── kds/                     # Real-time Kitchen Display System
│   ├── login/                   # User Authentication & Sign-in Page
│   ├── menu/                    # Public Digital Guest Menu & AI Concierge
│   ├── onboarding/              # Self-serve Tenant Registration & Business Setup
│   ├── partners/                # Partner Integration Landing Page
│   ├── pos/                     # Cashier Point-of-Sale Terminal Screen
│   ├── privacy/                 # Privacy Policy Documentation
│   ├── profile/                 # User Profile & Session Management
│   ├── register/                # User Registration Form
│   ├── reset-password/          # Password Reset Token Confirmation Page
│   ├── security/                # Security Information & Settings Page
│   ├── subscribe/               # Stripe Subscription Plan Selector Page
│   ├── super-admin/             # SaaS Platform Administrator Console
│   ├── support/                 # Merchant Support Ticket Helpdesk Page
│   ├── terms/                   # Terms of Service Page
│   ├── authContext.tsx          # Global React Auth Context Provider
│   ├── error.tsx                # Next.js App Router Error Boundary
│   ├── escposEncoder.ts         # ESC/POS Binary Thermal Printer Encoder
│   ├── global-error.tsx         # Global Uncaught Exception Boundary
│   ├── globals.css              # Global HSL CSS Custom Tokens & Tailwind Directives
│   ├── inventoryUtils.ts        # Inventory stock computation helper functions
│   ├── layout.tsx               # Root Application Layout wrapper
│   ├── loading.tsx              # Application Loading Spinner fallback
│   ├── not-found.tsx            # Custom 404 Page Not Found component
│   ├── page.tsx                 # SaaS Landing / Marketing Homepage
│   ├── printerContext.tsx       # Thermal Printer Socket Context Provider
│   ├── printerService.ts        # Hardware Thermal Printer Interface
│   ├── providers.tsx            # Unified React Provider Tree wrapper
│   ├── robots.ts                # SEO Robots.txt generator script
│   └── sitemap.ts               # Dynamic Sitemap generator script
├── src/                         # Extracted Modular React Components
│   ├── components/
│   │   ├── cms/                 # Menu & Category Content Management Modals
│   │   ├── dashboard/           # Dashboard widgets (Sales, Orders, Payments, Inventory)
│   │   ├── guards/              # AuthGuard & RoleGuard component wrappers
│   │   ├── layouts/             # Dashboard & Admin Header/Sidebar Layouts
│   │   ├── pos/                 # POS UI components (Cart, BillSplitter, TableGrid)
│   │   ├── super-admin/         # Super Admin tabs (Metrics, Tenants, Support, Audit)
│   │   ├── ui/                  # Reusable UI primitives (Buttons, Modals, Badges)
│   │   ├── DemoBanner.tsx       # Demo Mode status banner component
│   │   └── TrialGate.tsx        # Trial Expiration Lock overlay
│   ├── hooks/                   # Custom React Hooks
│   └── utils/                   # Client-side utility functions & API fetch helpers
├── public/                      # Static Assets (Images, SW script for PWA)
├── .env.example                 # Frontend environment variables template
├── Dockerfile                   # Multi-stage production container configuration
├── middleware.ts                # Next.js Edge middleware for route protection
├── next.config.ts               # Next.js build configuration & security headers
├── package.json                 # Frontend package manifest
└── tsconfig.json                # Frontend TypeScript configuration
```

---

## ⚡ Express API Backend (`apps/api`)

```
apps/api/
├── src/
│   ├── auth/                    # Auth utility functions
│   ├── controllers/             # Express API Route Controllers
│   │   ├── admin.controller.ts  # Super Admin Platform Management
│   │   ├── audit.controller.ts  # Audit Logging & Activity Streams
│   │   ├── auth.controller.ts   # User Authentication & JWT Session Control
│   │   ├── billing.controller.ts# Stripe Subscriptions & Webhook Processing
│   │   ├── concierge.controller.ts # Google Gemini AI Sommelier Chatbot
│   │   ├── inventory.controller.ts # Stock, Recipes, Waste Logs, Purchase Orders
│   │   ├── menu.controller.ts   # Menu Categories, Items, Variants & Addons
│   │   ├── order.controller.ts  # POS Order Creation, KDS Queue & Item Status
│   │   ├── table.controller.ts  # Floor Tables & Reservation Status
│   │   └── tenant.controller.ts # Organization Setup, Onboarding & Staff
│   ├── middleware/              # Express Pipeline Middleware
│   │   ├── audit.middleware.ts  # Post-response automated audit logger
│   │   ├── auth.ts              # JWT Token & DB session validator (requireAuth)
│   │   ├── organization.middleware.ts # Multi-tenant isolation (requireOrganizationMatch)
│   │   ├── permission.middleware.ts  # Granular RBAC Guard (requirePermission)
│   │   ├── security.ts          # Security response headers (setSecurityHeaders)
│   │   └── validation.ts        # Zod request body validation helper
│   ├── routes/                  # Express Router Endpoints
│   │   ├── admin.routes.ts
│   │   ├── audit.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── concierge.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── menu.routes.ts
│   │   ├── order.routes.ts
│   │   ├── table.routes.ts
│   │   └── tenant.routes.ts
│   ├── utils/                   # Server Utilities
│   │   ├── logger.js            # Pino structured logger instance
│   │   └── supabase.js          # Supabase client instantiation
│   └── server.ts                # Express application entrypoint & signal handlers
├── .env.example                 # API environment variables template
├── Dockerfile                   # API production container build script
└── package.json                 # Backend package manifest
```

---

## 🔗 Related Documentation

- [[architecture]] — System architecture overview and monorepo workspace design.
- [[tech-stack]] — Technology stack components and framework dependencies.
- [[frontend]] — Web frontend Next.js App Router layout and pages map.
- [[backend]] — Express backend server pipeline and controllers layout.

