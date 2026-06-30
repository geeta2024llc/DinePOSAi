import { Router } from 'express';
import { 
  signup, 
  login, 
  refresh, 
  logout, 
  forgotPassword, 
  resetPassword, 
  signupSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../controllers/auth.controller.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.post('/signup', validateSchema(signupSchema), signup);
router.post('/login', validateSchema(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validateSchema(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), resetPassword);

export default router;
