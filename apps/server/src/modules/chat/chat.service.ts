import Message, { IMessage } from './message.model';

export class ChatService {
  static async getMessagesByRoomId(roomId: string): Promise<IMessage[]> {
    return Message.find({
      $or: [
        { meetingId: roomId },
        { workspaceId: roomId },
        { projectId: roomId }
      ]
    })
      .populate('senderId', 'name avatarUrl role')
      .sort({ createdAt: 1 });
  }
}
