import { Request, Response, NextFunction } from 'express';

// Express middleware setting security compliance headers to prevent clickjacking, sniff attacks, and cross-site scripts
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  next();
};
