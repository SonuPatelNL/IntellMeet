import Meeting from '../../meetings/meeting.model';
import Task from '../../workspace/task.model';
import Transcript from '../../ai/transcript.model';
import { User } from '../../users/user.model';
import { AnalyticsRawMetrics, DailyMeetingMinutes } from '../analytics.types';

export class AnalyticsCollector {
  static async collectOverview(): Promise<AnalyticsRawMetrics> {
    const [totalMeetings, scheduledMeetings, activeMeetings, completedMeetings, cancelledMeetings] = await Promise.all([
      Meeting.countDocuments({}),
      Meeting.countDocuments({ status: 'scheduled' }),
      Meeting.countDocuments({ status: 'active' }),
      Meeting.countDocuments({ status: 'completed' }),
      Meeting.countDocuments({ status: 'cancelled' }),
    ]);

    const [todoCount, doingCount, doneCount] = await Promise.all([
      Task.countDocuments({ columnId: 'todo' }),
      Task.countDocuments({ columnId: 'doing' }),
      Task.countDocuments({ columnId: 'done' }),
    ]);

    const [aiSummaries, totalUsers] = await Promise.all([
      Transcript.countDocuments({ summary: { $exists: true, $ne: '' } }),
      User.countDocuments({}),
    ]);

    const completedMeetingRecords = await Meeting.find(
      {
        status: 'completed',
        startTime: { $exists: true },
        endTime: { $exists: true },
      },
      'startTime endTime'
    ).lean();

    const totalMeetingMinutes = completedMeetingRecords.reduce((sum, record: any) => {
      if (!record.startTime || !record.endTime) return sum;
      const durationMs = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
      return sum + Math.max(0, Math.round(durationMs / 1000 / 60));
    }, 0);

    const averageMeetingMinutes = completedMeetingRecords.length
      ? Math.round(totalMeetingMinutes / completedMeetingRecords.length)
      : 0;

    const recentMeetingMinutes = this.buildRecentMeetingMinutes(completedMeetingRecords);

    return {
      totalMeetings,
      scheduledMeetings,
      activeMeetings,
      completedMeetings,
      cancelledMeetings,
      totalMeetingMinutes,
      averageMeetingMinutes,
      todoCount,
      doingCount,
      doneCount,
      aiSummaries,
      totalUsers,
      recentMeetingMinutes,
    };
  }

  private static buildRecentMeetingMinutes(records: Array<{ startTime?: Date; endTime?: Date }>): DailyMeetingMinutes[] {
    const windowDays = 5;
    const buckets: DailyMeetingMinutes[] = Array.from({ length: windowDays }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (windowDays - 1 - index));
      return {
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        minutes: 0,
      };
    });

    const bucketMap = new Map<string, DailyMeetingMinutes>();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    buckets.forEach((bucket, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (windowDays - 1 - index));
      bucketMap.set(date.toISOString().slice(0, 10), bucket);
    });

    for (const record of records) {
      if (!record.endTime || !record.startTime) continue;
      const dateKey = new Date(record.endTime).toISOString().slice(0, 10);
      const bucket = bucketMap.get(dateKey);
      if (!bucket) continue;

      const durationMs = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
      bucket.minutes += Math.max(0, Math.round(durationMs / 1000 / 60));
    }

    return buckets;
  }
}
