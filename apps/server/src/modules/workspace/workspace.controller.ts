import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { WorkspaceService } from './workspace.service';
import { AuditLogService } from '../auditLogs/auditLogs.service';
import { AuditAction } from '../auditLogs/auditLog.model';

export const createWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.createWorkspace(req.user!.userId, req.body);
    res.status(201).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspaces = await WorkspaceService.listWorkspacesForUser(req.user!.userId);
    res.status(200).json({ status: 'success', data: { workspaces } });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.getWorkspaceById(req.params.id);
    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.inviteMember(req.params.id, req.user!.userId, req.body.userId, req.body.role);
    await AuditLogService.createAuditLog({
      user: req.user!.userId,
      action: AuditAction.MEMBER_INVITE,
      ip: req.ip,
      metadata: { workspaceId: req.params.id, invitedUserId: req.body.userId, role: req.body.role },
    });
    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.removeMember(req.params.id, req.user!.userId, req.params.userId);
    await AuditLogService.createAuditLog({
      user: req.user!.userId,
      action: AuditAction.MEMBER_REMOVE,
      ip: req.ip,
      metadata: { workspaceId: req.params.id, removedUserId: req.params.userId },
    });
    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.updateMemberRole(req.params.id, req.user!.userId, req.params.userId, req.body.role);
    await AuditLogService.createAuditLog({
      user: req.user!.userId,
      action: AuditAction.MEMBER_ROLE_UPDATE,
      ip: req.ip,
      metadata: { workspaceId: req.params.id, userId: req.params.userId, role: req.body.role },
    });
    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspaceSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.updateWorkspaceSettings(req.params.id, req.user!.userId, req.body);
    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await WorkspaceService.createProject(req.params.id, req.user!.userId, req.body);
    res.status(201).json({ status: 'success', data: { project } });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await WorkspaceService.listProjects(req.params.id);
    res.status(200).json({ status: 'success', data: { projects } });
  } catch (error) {
    next(error);
  }
};
