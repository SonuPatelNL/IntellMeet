import { Router } from 'express';
import { listAuditLogs } from './auditLogs.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole(['admin']), listAuditLogs);

export default router;
