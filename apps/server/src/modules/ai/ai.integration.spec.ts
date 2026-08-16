import { AIService } from './ai.service';
import { TranscriptionService } from './transcription';
import { SummaryService } from './summary';
import { ActionExtractor } from './actionExtractor';
import Meeting from '../meetings/meeting.model';
import Task from '../tasks/task.model';
import Transcript from './transcript.model';

jest.mock('./transcription');
jest.mock('./summary');
jest.mock('./actionExtractor');
jest.mock('../meetings/meeting.model');
jest.mock('../tasks/task.model');
jest.mock('./transcript.model');
jest.mock('../users/user.model');

describe('AIService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully run the full AI processing pipeline', async () => {
    const mockMeeting = {
      _id: 'meetingid123',
      hostId: 'userid123',
      workspaceId: 'workspaceid123',
      status: 'active',
      save: jest.fn().mockResolvedValue(true),
    };

    const mockTranscriptText = 'This is a test transcript.';
    const mockSummary = 'Meeting summary details.';
    const mockInsight = {
      summary: 'Meeting summary details.',
      keyPoints: ['Key point'],
      decisions: [{ title: 'Decision made' }],
      actionItems: [{ title: 'Task', owner: 'Alice' }],
      sentiment: { label: 'neutral', score: 0 },
    };
    const mockActionItems = [
      {
        title: 'Task A',
        description: 'Complete development',
        assigneeName: 'Alice',
        dueDateOffsetDays: 3,
      },
    ];

    const mockTask = { _id: 'taskid123' };
    const mockTranscriptDoc = { _id: 'transcriptid123' };

    (Meeting.findById as jest.Mock).mockResolvedValue(mockMeeting);
    (TranscriptionService.transcribeAudio as jest.Mock).mockResolvedValue(mockTranscriptText);
    jest.spyOn(AIService, 'analyzeTranscript').mockResolvedValue(mockInsight as any);
    (SummaryService.generateSummary as jest.Mock).mockResolvedValue(mockSummary);
    (ActionExtractor.extractActionItems as jest.Mock).mockResolvedValue(mockActionItems);
    (Task.create as jest.Mock).mockResolvedValue(mockTask);
    (Transcript.create as jest.Mock).mockResolvedValue(mockTranscriptDoc);

    const result = await AIService.processMeetingAudio('meetingid123', Buffer.from('mock_audio_data'));

    expect(Meeting.findById).toHaveBeenCalledWith('meetingid123');
    expect(TranscriptionService.transcribeAudio).toHaveBeenCalled();
    expect(ActionExtractor.extractActionItems).toHaveBeenCalledWith(mockTranscriptText);
    expect(Task.create).toHaveBeenCalled();
    expect(Transcript.create).toHaveBeenCalled();
    
    expect(mockMeeting.status).toBe('completed');
    expect(result.tasksCreatedCount).toBe(1);
    expect(result.transcript).toBeDefined();
  });
});
