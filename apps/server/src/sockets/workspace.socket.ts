import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './socket.server';

export const setupWorkspaceHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('workspace:join', (payload: { workspaceId?: string }, callback?: Function) => {
    const workspaceId = payload?.workspaceId;

    if (!workspaceId) {
      callback?.({ status: 'error', message: 'workspaceId is required' });
      return;
    }

    socket.join(`workspace:${workspaceId}`);
    callback?.({ status: 'success', workspaceId });
  });

  socket.on('workspace:leave', (payload: { workspaceId?: string }) => {
    const workspaceId = payload?.workspaceId;
    if (!workspaceId) return;

    socket.leave(`workspace:${workspaceId}`);
  });
};
