import { setupWorkspaceHandlers } from './workspace.socket';

describe('workspace socket handlers', () => {
  it('joins the workspace room when requested', () => {
    const handlers: Record<string, Function> = {};
    const socket = {
      on: jest.fn((event: string, cb: Function) => {
        handlers[event] = cb;
      }),
      join: jest.fn(),
      leave: jest.fn(),
      rooms: new Set<string>(),
      emit: jest.fn(),
    } as any;

    setupWorkspaceHandlers({} as any, socket);

    const callback = jest.fn();
    handlers['workspace:join']({ workspaceId: 'workspace-123' }, callback);

    expect(socket.join).toHaveBeenCalledWith('workspace:workspace-123');
    expect(callback).toHaveBeenCalledWith({ status: 'success', workspaceId: 'workspace-123' });
  });

  it('leaves the workspace room when requested', () => {
    const handlers: Record<string, Function> = {};
    const socket = {
      on: jest.fn((event: string, cb: Function) => {
        handlers[event] = cb;
      }),
      join: jest.fn(),
      leave: jest.fn(),
      rooms: new Set<string>(),
      emit: jest.fn(),
    } as any;

    setupWorkspaceHandlers({} as any, socket);

    handlers['workspace:leave']({ workspaceId: 'workspace-123' });

    expect(socket.leave).toHaveBeenCalledWith('workspace:workspace-123');
  });
});
