import { TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics.api';

interface DailyMeetingMinutes {
  day: string;
  minutes: number;
}

interface AnalyticsOverview {
  totalMeetings: number;
  scheduledMeetings: number;
  activeMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
  totalMeetingMinutes: number;
  averageMeetingMinutes: number;
  totalTasks: number;
  tasksByColumn: {
    todo: number;
    doing: number;
    done: number;
  };
  aiSummaries: number;
  totalUsers: number;
  recentMeetingMinutes: DailyMeetingMinutes[];
}

const DEFAULT_OVERVIEW: AnalyticsOverview = {
  totalMeetings: 0,
  scheduledMeetings: 0,
  activeMeetings: 0,
  completedMeetings: 0,
  cancelledMeetings: 0,
  totalMeetingMinutes: 0,
  averageMeetingMinutes: 0,
  totalTasks: 0,
  tasksByColumn: { todo: 0, doing: 0, done: 0 },
  aiSummaries: 0,
  totalUsers: 0,
  recentMeetingMinutes: [
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
  ],
};

export default function AnalyticsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then((res) => res.data.data.overview as AnalyticsOverview),
    retry: false,
    staleTime: 1000 * 60,
  });

  const overview = data ?? DEFAULT_OVERVIEW;
  const meetingHoursData = overview.recentMeetingMinutes.length
    ? overview.recentMeetingMinutes
    : DEFAULT_OVERVIEW.recentMeetingMinutes;

  // SVG Coordinates calculation for simple sparkline
  const width = 450;
  const height = 140;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxMins = Math.max(...meetingHoursData.map((d) => d.minutes), 60);
  const points = meetingHoursData.map((d, i) => {
    const x = padding + (i * chartWidth) / (meetingHoursData.length - 1);
    const y = padding + chartHeight - (d.minutes * chartHeight) / maxMins;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div>
          <h3 className="text-md font-semibold text-white">Productivity Analytics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Performance metrics and time allocation</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          <span>{overview.totalMeetingMinutes > 0 ? `${Math.round((overview.totalMeetingMinutes / Math.max(overview.totalMeetings, 1)) * 10) / 10}%` : '0%'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly meeting load sparkline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Meeting Minutes</h4>
            <span className="text-xs font-medium text-white">Total: {overview.totalMeetingMinutes} mins</span>
          </div>
          
          <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124, 58, 237)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(124, 58, 237)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />

              {/* Gradient fill */}
              <polygon
                points={`${padding},${padding + chartHeight} ${points} ${width - padding},${padding + chartHeight}`}
                fill="url(#chartGradient)"
              />

              {/* Spline line */}
              <polyline
                fill="none"
                stroke="rgb(139, 92, 246)"
                strokeWidth="2.5"
                points={points}
              />

              {/* Data points */}
              {meetingHoursData.map((d, i) => {
                const x = padding + (i * chartWidth) / (meetingHoursData.length - 1);
                const y = padding + chartHeight - (d.minutes * chartHeight) / maxMins;
                return (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle cx={x} cy={y} r="4" fill="rgb(139, 92, 246)" stroke="rgb(15, 23, 42)" strokeWidth="1.5" />
                    <circle cx={x} cy={y} r="8" fill="rgb(139, 92, 246)" className="opacity-0 group-hover/dot:opacity-20 transition-opacity" />
                  </g>
                );
              })}

              {/* Day Labels */}
              {meetingHoursData.map((d, i) => {
                const x = padding + (i * chartWidth) / (meetingHoursData.length - 1);
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 2}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Task Completion Ratios progress bar */}
        <div className="space-y-4 flex flex-col justify-center">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Task Status Distribution</h4>
            <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '65%' }} title="Completed: 65%" />
              <div className="h-full bg-indigo-500" style={{ width: '25%' }} title="In Progress: 25%" />
              <div className="h-full bg-slate-800" style={{ width: '10%' }} title="Todo: 10%" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mt-1">
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-400 font-medium uppercase">Done</p>
              <h5 className="text-sm font-bold text-white mt-0.5">{overview.tasksByColumn.done}</h5>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="h-2 w-2 rounded-full bg-indigo-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-400 font-medium uppercase">Doing</p>
              <h5 className="text-sm font-bold text-white mt-0.5">{overview.tasksByColumn.doing}</h5>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="h-2 w-2 rounded-full bg-slate-700 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-400 font-medium uppercase">Todo</p>
              <h5 className="text-sm font-bold text-white mt-0.5">{overview.tasksByColumn.todo}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
