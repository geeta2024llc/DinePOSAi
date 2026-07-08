import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { ApiResponse } from '@dineposai/shared-types';
import { setSecurityHeaders } from './middleware/security.js';
import authRouter from './routes/auth.routes.js';
import tenantRouter from './routes/tenant.routes.js';
import tableRouter from './routes/table.routes.js';
import menuRouter from './routes/menu.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import orderRouter from './routes/order.routes.js';
import conciergeRouter from './routes/concierge.routes.js';
import billingRouter from './routes/billing.routes.js';
import auditRouter from './routes/audit.routes.js';

dotenv.config();

// Pre-flight check for required environment variables
const REQUIRED_ENV = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const MISSING_ENV = REQUIRED_ENV.filter(key => !process.env[key]);
if (MISSING_ENV.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL ERROR: Missing required environment variables:');
  MISSING_ENV.forEach(key => console.error(`   - ${key}`));
  console.error('\x1b[31m%s\x1b[0m', 'Backend server cannot start without these variables. Please configure them in apps/api/.env');
  process.exit(1);
}

// Warn about test keys and weak secrets in production
if (process.env.NODE_ENV === 'production') {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: STRIPE_SECRET_KEY is using a test mode key (sk_test_...) in production environment!');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: STRIPE_SECRET_KEY is not defined. Stripe checkout operations will fall back to simulated upgrades.');
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: JWT_SECRET has less than 32 characters. It is highly recommended to use a longer high-entropy key for production.');
  }
}


const app = express();
const PORT = process.env.PORT || 4000;

// HTTPS enforcement — must run before any route handler in production
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(setSecurityHeaders);

// Simple in-memory rate limiter for auth endpoints
// Limits each IP to 20 requests per 15-minute window
const authRateLimits = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_REQUESTS = 20;

const authRateLimit = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const entry = authRateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    authRateLimits.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return next();
  }

  if (entry.count >= AUTH_MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      error: 'Too many requests from this IP. Please try again in 15 minutes.'
    });
  }

  entry.count++;
  next();
};

// Global Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRateLimit, authRouter);
app.use('/api/tenant', tenantRouter);
app.use('/api/tables', tableRouter);
app.use('/api/menu', menuRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/concierge', conciergeRouter);
app.use('/api/billing', billingRouter);
app.use('/api/audit', auditRouter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  const safeMessage = process.env.NODE_ENV === 'production'
    ? 'A system error occurred. Please contact support.'
    : err.message || 'Unknown Server Error';
  res.status(err.status || 500).json({ success: false, error: safeMessage });
});

app.listen(PORT, () => {
  console.log(`DinePosAI API Server listening on port ${PORT}`);
});
