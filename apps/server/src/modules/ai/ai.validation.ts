import { z } from 'zod';

export const analyzeTranscriptSchema = z.object({
  body: z.object({
    transcript: z.string().min(1, 'Transcript is required').max(10000, 'Transcript is too long'),
  }),
});

export const searchMeetingSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Query is required').max(200, 'Query is too long'),
  }),
});
