export interface MeetingInsight {
  summary: string;
  keyPoints: string[];
  decisions: Array<{ title: string; detail?: string }>;
  actionItems: Array<{ title: string; owner?: string; dueDate?: string }>;
  sentiment: { label: 'positive' | 'neutral' | 'negative'; score: number };
  transcript?: string;
}

export interface SearchResult {
  answer: string;
  sources: Array<{ meetingId: string; excerpt: string }>;
}
