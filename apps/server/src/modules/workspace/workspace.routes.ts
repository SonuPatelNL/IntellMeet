import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateWorkspaceSettings,
  createProject,
  listProjects,
} from './workspace.controller';
import {
  createWorkspaceSchema,
  workspaceIdParamSchema,
  inviteMemberSchema,
  memberRoleSchema,
  createProjectSchema,
} from './workspace.validation';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', validate(workspaceIdParamSchema), getWorkspace);
router.post('/:id/members', validate(inviteMemberSchema), inviteMember);
router.delete('/:id/members/:userId', validate(workspaceIdParamSchema), removeMember);
router.patch('/:id/members/:userId/role', validate(memberRoleSchema), updateMemberRole);
router.patch('/:id/settings', validate(workspaceIdParamSchema), updateWorkspaceSettings);
router.post('/:id/projects', validate(createProjectSchema), createProject);
router.get('/:id/projects', validate(workspaceIdParamSchema), listProjects);

export default router;
