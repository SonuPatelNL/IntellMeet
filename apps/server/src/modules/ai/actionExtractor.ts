import { openai } from '../../config/openai';

export interface ExtractedActionItem {
  title: string;
  description: string;
  assigneeName?: string; // Guess assignee name from transcript if possible
  dueDateOffsetDays?: number;
}

export class ActionExtractor {
  static async extractActionItems(transcriptText: string): Promise<ExtractedActionItem[]> {
    if (!openai) {
      console.log('[AI STUB] Extracting action items...');
      return [
        {
          title: 'Design modular frontend components',
          description: 'Ensure the new UI elements are fully decoupled and reusable.',
          assigneeName: 'Alice',
          dueDateOffsetDays: 3,
        },
        {
          title: 'Setup CI/CD pipelines',
          description: 'Build out automation pipelines for the release lifecycle.',
          assigneeName: 'Bob',
          dueDateOffsetDays: 5,
        },
      ];
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts action items from meeting transcripts. 
Your output MUST be a JSON object containing an array called "actionItems".
Each action item in the array MUST follow this structure:
{
  "title": "Short action name",
  "description": "Elaborated task description",
  "assigneeName": "Name of person assigned, or empty if unknown",
  "dueDateOffsetDays": Number of days from today this should be done, default is 3
}

Always return valid JSON, and nothing else.`,
          },
          {
            role: 'user',
            content: `Extract the action items from this transcript:\n\n${transcriptText}`,
          },
        ],
        temperature: 0.2,
      });

      const jsonText = response.choices[0].message.content || '{"actionItems": []}';
      const parsed = JSON.parse(jsonText);
      return parsed.actionItems || [];
    } catch (error) {
      console.error('Error in ActionExtractor:', error);
      return [];
    }
  }
}
