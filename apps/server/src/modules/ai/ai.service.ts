import { Types } from 'mongoose';
import { TranscriptionService } from './transcription';
import { SummaryService } from './summary';
import { ActionExtractor } from './actionExtractor';
import Transcript from './transcript.model';
import Meeting from '../meetings/meeting.model';
import Task from '../tasks/task.model';
import { User } from '../users/user.model';
import { MeetingIntelligenceProcessor } from './processors/meeting-intelligence.processor';
import { MeetingInsight, SearchResult } from './models/meeting-intelligence';
import { cacheGet, cacheSet } from '../../utils/cache';
import { aiRequestsTotal } from '../../monitoring/metrics';

export class AIService {
  /**
   * Processes a meeting's raw audio to transcribe, summarize, extract tasks, and store results.
   */
  static async processMeetingAudio(
    meetingId: string,
    audioBuffer: Buffer,
    recordingUrl?: string
  ): Promise<any> {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // 1. Transcribe speech to text
    const transcriptText = await TranscriptionService.transcribeAudio(audioBuffer);

    // 2. Generate meeting summary and structured insight payloads
    const insight = await this.analyzeTranscript(transcriptText);
    const summary = insight.summary;

    // 3. Extract action items
    const actionItems = await ActionExtractor.extractActionItems(transcriptText);

    // 4. Save extracted tasks in Database
    const savedTaskIds: Types.ObjectId[] = [];
    
    for (const item of actionItems) {
      // Attempt to map assigneeName to a User ID in our database
      let assigneeId: Types.ObjectId | undefined;
      if (item.assigneeName) {
        const matchedUser = await User.findOne({
          name: { $regex: new RegExp(item.assigneeName, 'i') },
        });
        if (matchedUser) {
          assigneeId = matchedUser._id as Types.ObjectId;
        }
      }

      // Calculate dueDate based on today plus offset
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (item.dueDateOffsetDays || 3));

      const task = await Task.create({
        title: item.title,
        description: item.description,
        creatorId: meeting.hostId,
        assigneeId,
        meetingId: meeting._id,
        workspaceId: meeting.workspaceId || new Types.ObjectId(), // fallback workspace if none
        status: 'todo',
        dueDate,
      });

      savedTaskIds.push(task._id as Types.ObjectId);
    }

    // 5. Store transcript & summaries in Database
    const transcript = await Transcript.create({
      meetingId: meeting._id,
      content: [
        {
          speakerName: 'Unidentified Speaker',
          timestamp: 0,
          text: transcriptText,
        },
      ],
      summary,
      actionItemIds: savedTaskIds,
      metadata: {
        keyPoints: insight.keyPoints,
        decisions: insight.decisions,
        sentiment: insight.sentiment,
      },
    });

    // 6. Update meeting status and recording URL
    meeting.status = 'completed';
    meeting.endTime = new Date();
    if (recordingUrl) {
      meeting.recordingUrl = recordingUrl;
    }
    await meeting.save();

    return {
      transcript,
      insight,
      tasksCreatedCount: savedTaskIds.length,
    };
  }

  static async analyzeTranscript(transcriptText: string): Promise<MeetingInsight> {
    const cacheKey = `ai:analyze:${String(transcriptText).slice(0, 200)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached as MeetingInsight;
    aiRequestsTotal.inc({ type: 'analyze' });
    const result = await MeetingIntelligenceProcessor.analyzeTranscript(transcriptText);
    await cacheSet(cacheKey, result, 60 * 60); // cache 1h
    return result;
  }

  static async searchMeetingKnowledge(question: string): Promise<SearchResult> {
    const cacheKey = `ai:search:${question}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached as SearchResult;

    const documentsQuery = Transcript.find({}) as any;
    const documents = typeof documentsQuery.lean === 'function' ? await documentsQuery.lean() : await documentsQuery;
    const normalizedDocuments = (documents || []).map((doc: any) => ({
      meetingId: doc.meetingId?.toString() || 'unknown',
      text: Array.isArray(doc.content) ? doc.content.map((item: any) => item.text).join(' ') : '',
      summary: doc.summary || '',
    }));

    aiRequestsTotal.inc({ type: 'search' });
    const out = await MeetingIntelligenceProcessor.searchMeetingKnowledge(question, normalizedDocuments);
    await cacheSet(cacheKey, out, 60 * 30); // 30m
    return out;
  }
}
