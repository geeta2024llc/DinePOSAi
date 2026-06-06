import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@dineposai/shared-types';

// Generic request body/query validator middleware using Zod schemas
export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      // Parse, validate, and automatically sanitize input fields to match schema structure
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return res.status(400).json({
          success: false,
          error: `Validation failed: ${errorMessages}`
        });
      }
      next(error);
    }
  };
};
