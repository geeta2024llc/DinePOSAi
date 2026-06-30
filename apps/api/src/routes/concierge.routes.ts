import { Router } from 'express';
import { chatWithAura, conciergeChatSchema } from '../controllers/concierge.controller.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

// This endpoint is public so customers sitting at tables can chat without signing in!
router.post('/chat', validateSchema(conciergeChatSchema), chatWithAura);

export default router;
