import { AnalyticsProcessor } from './analytics.processor';

describe('AnalyticsProcessor', () => {
  it('correctly transforms raw metrics into overview metrics', () => {
    const rawMetrics = {
      totalMeetings: 12,
      scheduledMeetings: 4,
      activeMeetings: 2,
      completedMeetings: 5,
      cancelledMeetings: 1,
      totalMeetingMinutes: 410,
      averageMeetingMinutes: 82,
      todoCount: 7,
      doingCount: 3,
      doneCount: 10,
      aiSummaries: 8,
      totalUsers: 21,
      recentMeetingMinutes: [
        { day: 'Mon', minutes: 60 },
        { day: 'Tue', minutes: 80 },
        { day: 'Wed', minutes: 100 },
        { day: 'Thu', minutes: 90 },
        { day: 'Fri', minutes: 80 },
      ],
    };

    const overview = AnalyticsProcessor.processOverview(rawMetrics);

    expect(overview.totalMeetings).toBe(12);
    expect(overview.scheduledMeetings).toBe(4);
    expect(overview.totalTasks).toBe(20);
    expect(overview.tasksByColumn).toEqual({ todo: 7, doing: 3, done: 10 });
    expect(overview.recentMeetingMinutes[2]?.minutes).toBe(100);
  });
});
