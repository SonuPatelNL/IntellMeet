import { AIService } from './ai.service';
import Transcript from './transcript.model';

jest.mock('./transcript.model');

describe('AI meeting intelligence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates structured meeting insights from a transcript', async () => {
    const result = await AIService.analyzeTranscript('We decided to increase the marketing budget by 20 percent. Alice will prepare the rollout plan.');

    expect(result.summary).toContain('marketing');
    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.decisions).toContainEqual(expect.objectContaining({ title: expect.any(String) }));
    expect(result.actionItems.length).toBeGreaterThan(0);
    expect(result.sentiment.label).toBeDefined();
  });

  it('answers questions by searching prior meeting transcripts', async () => {
    (Transcript.find as jest.Mock).mockResolvedValue([
      {
        meetingId: 'meeting-1',
        content: [{ text: 'We decided to increase the marketing budget by 20 percent.' }],
        summary: 'Marketing budget increased.',
      },
    ]);

    const result = await AIService.searchMeetingKnowledge('What did we decide about the marketing budget?');

    expect(result.answer).toContain('marketing budget');
    expect(result.sources.length).toBeGreaterThan(0);
  });
});
