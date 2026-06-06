import { Router } from 'express';
import { signup, login, signupSchema, loginSchema } from '../controllers/auth.controller.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.post('/signup', validateSchema(signupSchema), signup);
router.post('/login', validateSchema(loginSchema), login);

export default router;
