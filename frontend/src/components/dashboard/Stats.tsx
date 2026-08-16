import { Calendar, Clock, CheckCircle2, FileText } from 'lucide-react';

interface StatsProps {
  stats: {
    totalMeetings: number;
    totalHours: number;
    tasksCompleted: number;
    summariesGenerated: number;
  };
}

export default function Stats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Meetings',
      value: stats.totalMeetings,
      icon: Calendar,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Meeting Hours',
      value: `${stats.totalHours}h`,
      icon: Clock,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Tasks Completed',
      value: stats.tasksCompleted,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'AI Summaries',
      value: stats.summariesGenerated,
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex items-center gap-4 transition-all duration-300 hover:border-slate-700/60 group"
          >
            <div className={`p-3 rounded-lg border ${card.color} transition-all duration-300 group-hover:scale-105`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h4 className="text-2xl font-bold text-white mt-1">{card.value}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
}
