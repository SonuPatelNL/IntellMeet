export interface DailyMeetingMinutes {
  day: string;
  minutes: number;
}

export interface TaskColumnMetrics {
  todo: number;
  doing: number;
  done: number;
}

export interface AnalyticsRawMetrics {
  totalMeetings: number;
  scheduledMeetings: number;
  activeMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
  totalMeetingMinutes: number;
  averageMeetingMinutes: number;
  todoCount: number;
  doingCount: number;
  doneCount: number;
  aiSummaries: number;
  totalUsers: number;
  recentMeetingMinutes: DailyMeetingMinutes[];
}

export interface AnalyticsOverview {
  totalMeetings: number;
  scheduledMeetings: number;
  activeMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
  totalMeetingMinutes: number;
  averageMeetingMinutes: number;
  totalTasks: number;
  tasksByColumn: TaskColumnMetrics;
  aiSummaries: number;
  totalUsers: number;
  recentMeetingMinutes: DailyMeetingMinutes[];
}
