import { Router } from 'express';
import { register, login, logout, refresh } from './auth.controller';
import { validate } from '../../middleware/validator';
import { registerSchema, loginSchema } from './auth.validation';
import { requireAuth } from '../../middleware/auth.middleware';
import { csrfProtection } from '../../middleware/security.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', csrfProtection, requireAuth, logout);
router.post('/refresh', refresh);

export default router;
