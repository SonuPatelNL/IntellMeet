import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatService.getMessagesByRoomId(roomId);
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};
