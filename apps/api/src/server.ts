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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(setSecurityHeaders);

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/tenant', tenantRouter);
app.use('/api/tables', tableRouter);
app.use('/api/menu', menuRouter);

// HTTPS Enforcement Middleware (in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Global Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

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

// Error Handling Middleware (enforces safe non-leaking JSON responses)
app.use((err: any, req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  
  const safeMessage = process.env.NODE_ENV === 'production' 
    ? 'A system error occurred. Please contact support.' 
    : err.message || 'Unknown Server Error';

  res.status(err.status || 500).json({
    success: false,
    error: safeMessage
  });
});

app.listen(PORT, () => {
  console.log(`DinePosAI API Server listening on port ${PORT}`);
});
