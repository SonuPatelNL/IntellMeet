import { openai } from '../../config/openai';

export class SummaryService {
  static async generateSummary(transcriptText: string): Promise<string> {
    if (!openai) {
      console.log('[AI STUB] Generating meeting summary...');
      return `### Meeting Summary
- **Main Topic**: Aligning on core release components.
- **Key Discussion**: The team discussed the need for modularity in frontend components to support reuse. Additionally, CI/CD pipeline setups were discussed to secure the release lifecycle.
- **Key Decisions**:
  - Focus first on building clean reusable UI structures.
  - Implement full test runner automation.`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an elite enterprise assistant. Your job is to read the meeting transcript provided by the user and produce a structured, high-level meeting summary in Markdown. Organize it with sections: Overview, Key Discussion Points, and Decisions Made.',
          },
          {
            role: 'user',
            content: `Please summarize the following meeting transcript:\n\n${transcriptText}`,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || 'Failed to generate summary.';
    } catch (error) {
      console.error('Error in SummaryService:', error);
      throw new Error('Summary generation failed');
    }
  }
}
