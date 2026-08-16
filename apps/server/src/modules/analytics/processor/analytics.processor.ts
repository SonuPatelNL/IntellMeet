import { AnalyticsRawMetrics, AnalyticsOverview } from '../analytics.types';

export class AnalyticsProcessor {
  static processOverview(raw: AnalyticsRawMetrics): AnalyticsOverview {
    const totalTasks = raw.todoCount + raw.doingCount + raw.doneCount;

    return {
      totalMeetings: raw.totalMeetings,
      scheduledMeetings: raw.scheduledMeetings,
      activeMeetings: raw.activeMeetings,
      completedMeetings: raw.completedMeetings,
      cancelledMeetings: raw.cancelledMeetings,
      totalMeetingMinutes: raw.totalMeetingMinutes,
      averageMeetingMinutes: raw.averageMeetingMinutes,
      totalTasks,
      tasksByColumn: {
        todo: raw.todoCount,
        doing: raw.doingCount,
        done: raw.doneCount,
      },
      aiSummaries: raw.aiSummaries,
      totalUsers: raw.totalUsers,
      recentMeetingMinutes: raw.recentMeetingMinutes,
    };
  }
}
