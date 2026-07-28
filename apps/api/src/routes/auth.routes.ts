// ============================================================
// DinePosAI - Authentication Routes Configuration
// ============================================================

import { Router } from 'express';
import { 
  signup, 
  login, 
  refresh, 
  logout, 
  logoutAll,
  forgotPassword, 
  resetPassword, 
  resetPasswordSupabase,
  changePassword,
  changeEmail,
  getMe,
  updateProfile,
  getSessions,
  revokeSession,
  getLoginHistory,
  signupSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  changePasswordSchema,
  changeEmailSchema
} from '../controllers/auth.controller.js';
import { validateSchema } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/signup', validateSchema(signupSchema), signup);
router.post('/login', validateSchema(loginSchema), login);
router.post('/refresh', refresh);
router.post('/forgot-password', validateSchema(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), resetPassword);
router.post('/reset-password-supabase', validateSchema(resetPasswordSchema), resetPasswordSupabase);

// Protected routes (Authentication context required)
router.post('/logout', requireAuth, logout);
router.post('/logout-all', requireAuth, logoutAll);
router.post('/change-password', requireAuth, validateSchema(changePasswordSchema), changePassword);
router.post('/change-email', requireAuth, validateSchema(changeEmailSchema), changeEmail);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.get('/sessions', requireAuth, getSessions);
router.delete('/sessions/:id', requireAuth, revokeSession);
router.get('/login-history', requireAuth, getLoginHistory);

export default router;
