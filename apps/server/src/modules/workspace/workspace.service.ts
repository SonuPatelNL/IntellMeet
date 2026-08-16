import { Types } from 'mongoose';
import Workspace, { IWorkspace } from './workspace.model';
import Project from './project.model';
import { AppError } from '../../middleware/error.middleware';

function makeError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export class WorkspaceService {
  static async createWorkspace(userId: string | Types.ObjectId, input: { name: string; description?: string }) {
    const workspace = await Workspace.create({
      name: input.name,
      description: input.description,
      ownerId: userId,
      members: [{ userId, role: 'owner' }],
    });

    return workspace;
  }

  static async getWorkspaceById(workspaceId: string) {
    const workspace = await Workspace.findById(workspaceId)
      .populate('ownerId', 'name email avatarUrl')
      .populate('members.userId', 'name email avatarUrl');

    if (!workspace) {
      throw makeError('Workspace not found', 404);
    }

    return workspace;
  }

  static async listWorkspacesForUser(userId: string | Types.ObjectId): Promise<IWorkspace[]> {
    return Workspace.find({ 'members.userId': userId })
      .populate('ownerId', 'name email avatarUrl')
      .sort({ createdAt: -1 });
  }

  static async inviteMember(workspaceId: string, inviterId: string | Types.ObjectId, userId: string | Types.ObjectId, role: WorkspaceRole = 'member') {
    const workspace = await this.getWorkspaceById(workspaceId);
    const inviterRole = this.getMemberRole(workspace, inviterId);

    if (!this.canManageMembers(inviterRole)) {
      throw makeError('Insufficient permissions', 403);
    }

    const exists = workspace.members.some((member) => member.userId.toString() === userId.toString());
    if (exists) {
      throw makeError('User is already a member', 409);
    }

    workspace.members.push({ userId: new Types.ObjectId(userId.toString()), role });
    await workspace.save();
    return workspace;
  }

  static async removeMember(workspaceId: string, removerId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const workspace = await this.getWorkspaceById(workspaceId);
    const removerRole = this.getMemberRole(workspace, removerId);

    if (!this.canManageMembers(removerRole)) {
      throw makeError('Insufficient permissions', 403);
    }

    const target = workspace.members.find((member) => member.userId.toString() === userId.toString());
    if (!target) {
      throw makeError('Member not found', 404);
    }

    if (target.role === 'owner') {
      throw makeError('Owner cannot be removed', 403);
    }

    workspace.members = workspace.members.filter((member) => member.userId.toString() !== userId.toString());
    await workspace.save();
    return workspace;
  }

  static async updateMemberRole(workspaceId: string, actorId: string | Types.ObjectId, userId: string | Types.ObjectId, role: WorkspaceRole) {
    const workspace = await this.getWorkspaceById(workspaceId);
    const actorRole = this.getMemberRole(workspace, actorId);

    if (!this.canManageMembers(actorRole)) {
      throw makeError('Insufficient permissions', 403);
    }

    const target = workspace.members.find((member) => member.userId.toString() === userId.toString());
    if (!target) {
      throw makeError('Member not found', 404);
    }

    target.role = role;
    await workspace.save();
    return workspace;
  }

  static async updateWorkspaceSettings(workspaceId: string, actorId: string | Types.ObjectId, updates: { name?: string; description?: string }) {
    const workspace = await this.getWorkspaceById(workspaceId);
    const actorRole = this.getMemberRole(workspace, actorId);

    if (!this.canManageWorkspace(actorRole)) {
      throw makeError('Insufficient permissions', 403);
    }

    Object.assign(workspace, updates);
    await workspace.save();
    return workspace;
  }

  static async createProject(workspaceId: string, userId: string | Types.ObjectId, input: { name: string; description?: string }) {
    const workspace = await this.getWorkspaceById(workspaceId);
    const actorRole = this.getMemberRole(workspace, userId);

    if (!this.canManageWorkspace(actorRole)) {
      throw makeError('Insufficient permissions', 403);
    }

    return Project.create({
      workspaceId,
      name: input.name,
      description: input.description,
      members: [userId],
    });
  }

  static async listProjects(workspaceId: string) {
    return Project.find({ workspaceId }).sort({ createdAt: -1 });
  }

  private static getMemberRole(workspace: IWorkspace, userId: string | Types.ObjectId): WorkspaceRole {
    const member = workspace.members.find((item) => item.userId.toString() === userId.toString());
    if (!member) {
      return 'guest';
    }

    if (workspace.ownerId.toString() === userId.toString()) {
      return 'owner';
    }

    return member.role as WorkspaceRole;
  }

  private static canManageMembers(role: WorkspaceRole): boolean {
    return role === 'owner' || role === 'admin';
  }

  private static canManageWorkspace(role: WorkspaceRole): boolean {
    return role === 'owner' || role === 'admin' || role === 'member';
  }
}
