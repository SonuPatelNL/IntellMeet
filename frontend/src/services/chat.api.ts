import { api } from './api';

export interface ChatMessage {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    role: 'admin' | 'manager' | 'user';
  } | string;
  meetingId?: string;
  workspaceId?: string;
  projectId?: string;
  type: 'text' | 'file';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getHistory: (roomId: string) =>
    api.get<{ status: string; results: number; data: { messages: ChatMessage[] } }>(
      `/chat/history/${roomId}`
    ),
};
