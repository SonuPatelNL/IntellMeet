import { AnalyticsService } from './analytics.service';
import { AnalyticsCollector } from './collector/analytics.collector';

jest.mock('./collector/analytics.collector');

describe('AnalyticsService', () => {
  it('returns processed analytics overview', async () => {
    (AnalyticsCollector.collectOverview as jest.Mock).mockResolvedValue({
      totalMeetings: 20,
      scheduledMeetings: 5,
      activeMeetings: 3,
      completedMeetings: 10,
      cancelledMeetings: 2,
      totalMeetingMinutes: 450,
      averageMeetingMinutes: 45,
      todoCount: 8,
      doingCount: 4,
      doneCount: 12,
      aiSummaries: 9,
      totalUsers: 18,
      recentMeetingMinutes: [
        { day: 'Mon', minutes: 50 },
        { day: 'Tue', minutes: 90 },
        { day: 'Wed', minutes: 100 },
        { day: 'Thu', minutes: 80 },
        { day: 'Fri', minutes: 130 },
      ],
    });

    const overview = await AnalyticsService.getOverview();

    expect(overview.totalMeetings).toBe(20);
    expect(overview.tasksByColumn.done).toBe(12);
    expect(overview.totalTasks).toBe(24);
    expect(overview.recentMeetingMinutes[4].minutes).toBe(130);
  });
});
