# DinePosAi - Technology Stack

## 🛠 Core Frameworks & Runtimes

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Monorepo Package Manager** | [pnpm](https://pnpm.io/) | `^9.x` | High-performance workspace package manager managing `apps/*` and `packages/*`. |
| **Language Runtime** | [Node.js](https://nodejs.org/) | `>=18.x` | Server-side JavaScript runtime environment. |
| **Type System** | [TypeScript](https://www.typescriptlang.org/) | `^5.4.5` | Strict static typing across frontend web, backend API, and shared types. |
| **Frontend Framework** | [Next.js](https://nextjs.org/) | `16.2.7` | App Router React framework for server/client component rendering, routing, and metadata. |
| **Backend Framework** | [Express](https://expressjs.com/) | `^4.19.2` | RESTful API server framework for Node.js. |
| **Database & Persistence** | [Supabase PostgreSQL](https://supabase.com/) | PostgreSQL 15+ | Multi-tenant relational database with Row-Level Security (RLS) policies. |

---

## 🎨 Frontend Tech Stack (`apps/web`)

| Library / Tool | Version | Function |
|----------------|---------|----------|
| **React** | `^19.0.0` | Declarative component UI library. |
| **React DOM** | `^19.0.0` | DOM rendering engine for React. |
| **Tailwind CSS** | `^3.4.1` | Utility-first CSS framework for layout and styling. |
| **Lucide React** | `^0.378.0` | Modern SVG icon set used across POS, KDS, and Admin dashboards. |
| **Zod** | `^3.23.8` | Schema declaration and validation for frontend form inputs. |
| **Sentry Next.js SDK** | `^8.0.0` | Real-time frontend exception and performance tracking. |
| **PostHog JS** | `^1.130.0` | Product analytics and user interaction tracking. |
| **PostCSS & Autoprefixer** | Standard | CSS transformation and cross-browser vendor prefixing. |

---

## ⚙️ Backend Tech Stack (`apps/api`)

| Library / Tool | Version | Function |
|----------------|---------|----------|
| **jsonwebtoken** | `^9.0.2` | HS256 JWT signing, verification, and token payload decoding. |
| **bcryptjs** | `^2.4.3` | Password hashing for local super admin credentials. |
| **express-rate-limit** | `^7.2.0` | IP-based rate limiting to prevent brute-force attacks and API abuse. |
| **cors** | `^2.8.5` | Cross-Origin Resource Sharing control with dynamic origin matching. |
| **cookie-parser** | `^1.4.6` | Parsing HTTP cookie headers. |
| **pino & pino-http** | `^8.17.2` | Structured, high-speed JSON request logger. |
| **@sentry/node** | `^8.0.0` | Backend error logging and stack trace reporting. |
| **dotenv** | `^16.4.5` | Environment variable loader from `.env` files. |
| **tsx** | `^4.10.5` | Fast TypeScript execution engine for dev mode with hot reloading. |

---

## 🔌 Third-Party SDKs & External Services

| Service | SDK / Dependency | Function |
|---------|------------------|----------|
| **Stripe Payments** | `stripe ^15.7.0` | Subscription billing, checkout sessions, webhooks, invoice generation. |
| **Google Gemini AI** | Direct REST API via `fetch` | Interactive AI Sommelier/Concierge chatbot in digital menu (`gemini-1.5-flash`). |
| **Resend Email Service** | Direct REST API via `fetch` | Transactional welcome emails, password resets, and receipts. |
| **Supabase JS Client** | `@supabase/supabase-js ^2.43.1` | Direct SQL database querying, auth token validation, session checks. |
| **ESC/POS Hardware Printing** | Native Node `net` / Custom Buffer | Direct TCP binary byte stream encoding for EPSON/Star thermal receipt printers. |

---

## 🧪 Development, Build & Infrastructure Tools

| Tool | Purpose | Configuration File |
|------|---------|--------------------|
| **Docker** | Multi-stage production containerization for Express API and Next.js Web. | [apps/api/Dockerfile](file:///h:/Antigravity/DinePosAi/apps/api/Dockerfile), [apps/web/Dockerfile](file:///h:/Antigravity/DinePosAi/apps/web/Dockerfile) |
| **Vercel** | Edge network hosting platform for Next.js Web application. | Configured via Vercel dashboard. |
| **Railway / Render** | Container runtime hosting for Express API backend. | Configured via Dockerfile root directory. |
| **Supabase CLI / Scripts** | Automated SQL database migration deployer script. | [deploy-migrations.js](file:///h:/Antigravity/DinePosAi/scripts/deploy-migrations.js) |
