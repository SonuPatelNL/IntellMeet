import { Types } from 'mongoose';
import Task, { ITask } from './task.model';
import Workspace from './workspace.model';
import { AppError } from '../../middleware/error.middleware';
import { Server } from 'socket.io';

function makeError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export class TaskService {
  static async createTask(input: {
    title: string;
    description?: string;
    workspaceId: string | Types.ObjectId;
    projectId?: string | Types.ObjectId;
    columnId?: string;
    assigneeId?: string | Types.ObjectId;
    dueDate?: string | Date;
    labels?: string[];
    createdBy: string | Types.ObjectId;
  }, io?: Server) {
    const workspace = await Workspace.findById(input.workspaceId);
    if (!workspace) {
      throw makeError('Workspace not found', 404);
    }

    const task = await Task.create({
      ...input,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      columnId: input.columnId ?? 'todo',
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      labels: input.labels ?? [],
      createdBy: input.createdBy,
    });

    if (io) {
      io.to(`workspace:${workspace._id}`).emit('task:created', { task });
    }

    return task;
  }

  static async listTasks(workspaceId: string | Types.ObjectId) {
    return Task.find({ workspaceId }).sort({ createdAt: -1 }).populate('assigneeId', 'name avatarUrl');
  }

  static async getTask(taskId: string) {
    const task = await Task.findById(taskId).populate('assigneeId', 'name avatarUrl');
    if (!task) {
      throw makeError('Task not found', 404);
    }
    return task;
  }

  static async updateTask(taskId: string, updates: Partial<ITask>, io?: Server) {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    if (!task) {
      throw makeError('Task not found', 404);
    }

    if (io) {
      io.to(`workspace:${task.workspaceId}`).emit('task:updated', { task });
    }

    return task;
  }

  static async addComment(taskId: string, userId: string | Types.ObjectId, text: string, io?: Server) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw makeError('Task not found', 404);
    }

    task.comments.push({
      userId: new Types.ObjectId(userId.toString()),
      text,
      createdAt: new Date(),
    });
    await task.save();

    if (io) {
      io.to(`workspace:${task.workspaceId}`).emit('task:comment-added', { task });
    }

    return task;
  }
}
