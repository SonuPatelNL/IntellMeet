import OpenAI from 'openai';
import { env } from './env';

if (!env.openaiApiKey) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not defined. AI features will fallback to stub mode.');
}

export const openai = env.openaiApiKey
  ? new OpenAI({ apiKey: env.openaiApiKey })
  : null;
