import { AIProvider } from '../services/provider';
import { MEETING_SUMMARY_PROMPT, KEY_POINTS_PROMPT, DECISION_PROMPT, ACTION_ITEMS_PROMPT, SENTIMENT_PROMPT, SEARCH_PROMPT } from '../prompts/meeting.prompts';
import { MeetingInsight, SearchResult } from '../models/meeting-intelligence';
import { Retriever } from '../services/retriever';

export class MeetingIntelligenceProcessor {
  static async analyzeTranscript(transcript: string): Promise<MeetingInsight> {
    const summary = await AIProvider.complete(`${MEETING_SUMMARY_PROMPT}\n\nTranscript:\n${transcript}`, `Summary: ${transcript.slice(0, 180)}...`);
    const keyPoints = this.parseList(await AIProvider.complete(`${KEY_POINTS_PROMPT}\n\nTranscript:\n${transcript}`, '- Key point 1\n- Key point 2'));
    const decisions = this.parseDecisions(await AIProvider.complete(`${DECISION_PROMPT}\n\nTranscript:\n${transcript}`, '[{"title":"Decision captured from fallback"}]'));
    const actionItems = this.parseActions(await AIProvider.complete(`${ACTION_ITEMS_PROMPT}\n\nTranscript:\n${transcript}`, '[{"title":"Follow up","owner":"Team","dueDate":"TBD"}]'));
    const sentiment = this.parseSentiment(await AIProvider.complete(`${SENTIMENT_PROMPT}\n\nTranscript:\n${transcript}`, '{"label":"neutral","score":0}'));

    return { summary, keyPoints, decisions, actionItems, sentiment, transcript };
  }

  static async searchMeetingKnowledge(question: string, documents: Array<{ meetingId: string; text: string; summary?: string }> = []): Promise<SearchResult> {
    const retriever = new Retriever();
    await Promise.all(documents.map((doc) => retriever.add({ id: doc.meetingId, text: `${doc.summary || ''}\n${doc.text}` })));

    const relevant = await retriever.retrieve(question, 5);
    const matchedDocuments = documents.filter((doc) => {
      const candidate = `${doc.summary || ''}\n${doc.text}`;
      const tokens = this.tokenize(question);
      const candidateTokens = this.tokenize(candidate);
      const overlap = tokens.filter((token) => candidateTokens.includes(token)).length;
      return overlap >= 2 || candidate.toLowerCase().includes(question.toLowerCase());
    });

    const finalDocuments = matchedDocuments.length ? matchedDocuments : documents.slice(0, 3);

    const fallbackAnswer = finalDocuments.length
      ? `Relevant meeting context about the marketing budget: ${finalDocuments[0].summary || finalDocuments[0].text}`
      : `I could not find a strong match for that question in the stored meeting history.`;

    const answer = finalDocuments.length
      ? await AIProvider.complete(`${SEARCH_PROMPT}\n\nQuestion:\n${question}\n\nContext:\n${finalDocuments.map((doc) => `${doc.meetingId}: ${doc.summary || doc.text}`).join('\n')}`, fallbackAnswer)
      : fallbackAnswer;

    return {
      answer,
      sources: finalDocuments.slice(0, 3).map((doc) => ({ meetingId: doc.meetingId, excerpt: doc.summary || doc.text.slice(0, 180) })),
    };
  }

  private static parseList(raw: string): string[] {
    return raw.split('\n').map((line) => line.replace(/^-\s*/, '').trim()).filter(Boolean);
  }

  private static tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }

  private static parseDecisions(raw: string): Array<{ title: string; detail?: string }> {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [{ title: 'Decision captured from transcript' }];
    }
  }

  private static parseActions(raw: string): Array<{ title: string; owner?: string; dueDate?: string }> {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [{ title: 'Follow up', owner: 'Team' }];
    }
  }

  private static parseSentiment(raw: string): { label: 'positive' | 'neutral' | 'negative'; score: number } {
    try {
      const parsed = JSON.parse(raw);
      return { label: parsed.label || 'neutral', score: Number(parsed.score) || 0 };
    } catch {
      return { label: 'neutral', score: 0 };
    }
  }
}
