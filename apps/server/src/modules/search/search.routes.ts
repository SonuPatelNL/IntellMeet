import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { globalSearch } from './search.controller';

const router = Router();

router.use(requireAuth);
router.get('/', globalSearch);

export default router;
