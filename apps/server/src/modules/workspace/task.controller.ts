import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { TaskService } from './task.service';
import { getSocketServer } from '../../sockets/socket.server';

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const io = getSocketServer();
    const task = await TaskService.createTask({
      ...req.body,
      createdBy: req.user!.userId,
    }, io);
    res.status(201).json({ status: 'success', data: { task } });
  } catch (error) {
    next(error);
  }
};

export const listTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await TaskService.listTasks(req.params.workspaceId);
    res.status(200).json({ status: 'success', data: { tasks } });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.getTask(req.params.id);
    res.status(200).json({ status: 'success', data: { task } });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const io = getSocketServer();
    const task = await TaskService.updateTask(req.params.id, req.body, io);
    res.status(200).json({ status: 'success', data: { task } });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const io = getSocketServer();
    const task = await TaskService.addComment(req.params.id, req.user!.userId, req.body.text, io);
    res.status(201).json({ status: 'success', data: { task } });
  } catch (error) {
    next(error);
  }
};
