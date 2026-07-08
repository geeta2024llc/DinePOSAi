import express, { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
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

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

// Pre-flight check for required environment variables
const REQUIRED_ENV = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

if (process.env.NODE_ENV === 'production') {
  REQUIRED_ENV.push(
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'GEMINI_API_KEY',
    'FRONTEND_URL'
  );
}

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

// Dynamic CORS configurations supporting multiple frontends
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware with rawBody capture for Stripe signature verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/billing/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(cookieParser());
app.use(setSecurityHeaders);

// Define Rate Limiters using express-rate-limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const conciergeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, error: 'Too many concierge queries. Please wait a moment before sending another message.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global Logging Middleware using pino-http
app.use(pinoHttp({
  logger,
  // Custom request/response message format
  customSuccessMessage: (req, res, time) => {
    return `${req.method} ${req.url} ${res.statusCode} completed in ${time}ms`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  },
  // Avoid logging health checks to keep logs cleaner
  autoLogging: {
    ignore: (req) => req.url?.endsWith('/health') || false
  }
}));

// Health Check Endpoint (public and unrate-limited)
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

// Apply global rate limiting to all routes after /health
app.use(globalLimiter);

// Mount API Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/tenant', tenantRouter);
app.use('/api/tables', tableRouter);
app.use('/api/menu', menuRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/concierge', conciergeLimiter, conciergeRouter);
app.use('/api/billing', billingRouter);
app.use('/api/audit', auditRouter);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  logger.error(err, 'Unhandled error in Express request pipeline');
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  const safeMessage = process.env.NODE_ENV === 'production'
    ? 'A system error occurred. Please contact support.'
    : err.message || 'Unknown Server Error';
  res.status(err.status || 500).json({ success: false, error: safeMessage });
});

const server = app.listen(PORT, () => {
  logger.info(`DinePosAI API Server listening on port ${PORT}`);
});

// Graceful Shutdown Handler
function gracefulShutdown(signal: string, code: number = 0) {
  logger.info(`${signal} received. Initiating graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(code);
  });

  // Force shutdown after 10 seconds if active requests hang
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, force exiting.');
    process.exit(1);
  }, 10000).unref();
}

// System termination signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));

// Process exception handlers
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught Exception detected!');
  gracefulShutdown('UncaughtException', 1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection detected!');
});
