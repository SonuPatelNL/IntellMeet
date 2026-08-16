import { z } from 'zod';

export const chatHistorySchema = z.object({
  params: z.object({
    roomId: z.string().min(1, 'Room ID is required'),
  }),
});
