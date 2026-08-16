import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import Workspace from './workspace.model';

export type WorkspacePermission = 'manage_workspace' | 'manage_members' | 'manage_projects' | 'manage_tasks';

const rolePermissions: Record<string, WorkspacePermission[]> = {
  owner: ['manage_workspace', 'manage_members', 'manage_projects', 'manage_tasks'],
  admin: ['manage_workspace', 'manage_members', 'manage_projects', 'manage_tasks'],
  member: ['manage_projects', 'manage_tasks'],
  guest: [],
};

export const requireWorkspacePermission = (permission: WorkspacePermission) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.id || req.params.workspaceId;
      if (!workspaceId) {
        return next();
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        const error = new Error('Workspace not found') as any;
        error.statusCode = 404;
        error.isOperational = true;
        return next(error);
      }

      const isOwner = workspace.ownerId.toString() === req.user!.userId;
      const membership = workspace.members.find((member: any) => member.userId.toString() === req.user!.userId);
      const role = isOwner ? 'owner' : membership?.role ?? 'guest';

      if (!rolePermissions[role]?.includes(permission)) {
        const error = new Error('Forbidden: insufficient workspace permission') as any;
        error.statusCode = 403;
        error.isOperational = true;
        return next(error);
      }

      req.workspaceRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
