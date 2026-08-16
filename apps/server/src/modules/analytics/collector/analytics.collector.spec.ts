import { AnalyticsCollector } from './analytics.collector';
import Meeting from '../../meetings/meeting.model';
import Task from '../../workspace/task.model';
import Transcript from '../../ai/transcript.model';
import { User } from '../../users/user.model';

jest.mock('../../meetings/meeting.model');
jest.mock('../../workspace/task.model');
jest.mock('../../ai/transcript.model');
jest.mock('../../users/user.model');

describe('AnalyticsCollector', () => {
  it('collects metrics from meetings, tasks, transcripts and users', async () => {
    (Meeting.countDocuments as jest.Mock).mockResolvedValueOnce(20);
    (Meeting.countDocuments as jest.Mock).mockResolvedValueOnce(5);
    (Meeting.countDocuments as jest.Mock).mockResolvedValueOnce(3);
    (Meeting.countDocuments as jest.Mock).mockResolvedValueOnce(10);
    (Meeting.countDocuments as jest.Mock).mockResolvedValueOnce(2);

    (Task.countDocuments as jest.Mock).mockResolvedValueOnce(6);
    (Task.countDocuments as jest.Mock).mockResolvedValueOnce(4);
    (Task.countDocuments as jest.Mock).mockResolvedValueOnce(8);

    (Transcript.countDocuments as jest.Mock).mockResolvedValueOnce(12);
    (User.countDocuments as jest.Mock).mockResolvedValueOnce(15);

    (Meeting.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

    const result = await AnalyticsCollector.collectOverview();

    expect(result.totalMeetings).toBe(20);
    expect(result.scheduledMeetings).toBe(5);
    expect(result.todoCount).toBe(6);
    expect(result.aiSummaries).toBe(12);
    expect(result.totalUsers).toBe(15);
    expect(result.recentMeetingMinutes).toHaveLength(5);
  });
});
