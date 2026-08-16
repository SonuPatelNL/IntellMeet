import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import { createTask, listTasks, getTask, updateTask, addTaskComment } from './task.controller';
import { createTaskSchema, taskIdParamSchema, taskCommentSchema } from './task.validation';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createTaskSchema), createTask);
router.get('/workspace/:workspaceId', listTasks);
router.get('/:id', validate(taskIdParamSchema), getTask);
router.patch('/:id', validate(taskIdParamSchema), updateTask);
router.post('/:id/comments', validate(taskCommentSchema), addTaskComment);

export default router;
