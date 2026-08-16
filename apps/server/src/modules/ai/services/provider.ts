import { openai } from '../../../config/openai';

export interface ProviderResponse {
  text: string;
}

export class AIProvider {
  static async complete(prompt: string, fallback: string): Promise<string> {
    if (!openai) {
      return fallback;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || fallback;
    } catch (error) {
      console.error('[AIProvider] completion failed', error);
      return fallback;
    }
  }
}
