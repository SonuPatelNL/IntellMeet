import { openai } from '../../config/openai';
import { toFile } from 'openai';

export class TranscriptionService {
  static async transcribeAudio(audioBuffer: Buffer, filename = 'audio.webm'): Promise<string> {
    if (!openai) {
      console.log('[AI STUB] Transcribing audio buffer...');
      return 'Hello, welcome to the IntellMeet demo meeting. Today we are going to align on the core components for the product release. Alice, please make sure the frontend architecture is fully modular. Bob, please set up the CI/CD pipelines by Friday.';
    }

    try {
      const file = await toFile(audioBuffer, filename);
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });
      return response.text;
    } catch (error) {
      console.error('Error in TranscriptionService:', error);
      throw new Error('Speech-to-text transcription failed');
    }
  }
}
