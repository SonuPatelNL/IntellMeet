import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import { getChatHistory } from './chat.controller';
import { chatHistorySchema } from './chat.validation';

const router = Router();

router.use(requireAuth);

router.get('/history/:roomId', validate(chatHistorySchema), getChatHistory);

export default router;
