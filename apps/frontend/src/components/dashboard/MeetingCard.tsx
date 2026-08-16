import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Video, FileText, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MeetingCardProps {
  meeting: {
    _id: string;
    title: string;
    description?: string;
    startTime: string;
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    hostId: { name: string; email: string };
    recordingUrl?: string;
  };
  onJoin?: (id: string) => void;
  onViewSummary?: (id: string) => void;
}

export default function MeetingCard({ meeting, onJoin, onViewSummary }: MeetingCardProps) {
  const formattedDate = new Date(meeting.startTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(meeting.startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:border-slate-700/60">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-semibold text-white text-base truncate" title={meeting.title}>
            {meeting.title}
          </h4>
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0',
              meeting.status === 'active' && 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse',
              meeting.status === 'scheduled' && 'text-primary bg-primary/10 border-primary/20',
              meeting.status === 'completed' && 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              meeting.status === 'cancelled' && 'text-slate-400 bg-slate-500/10 border-slate-500/20'
            )}
          >
            {meeting.status}
          </span>
        </div>
        
        {meeting.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {meeting.description}
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-slate-800/60 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-slate-300">
            {meeting.hostId.name.substring(0, 2).toUpperCase()}
          </div>
          <span>Host: {meeting.hostId.name}</span>
        </div>
      </div>

      <div className="flex gap-2.5 mt-1">
        {meeting.status === 'active' && onJoin && (
          <Button
            onClick={() => onJoin(meeting._id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 py-2 rounded-lg"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Join Call</span>
          </Button>
        )}

        {meeting.status === 'scheduled' && onJoin && (
          <Button
            onClick={() => onJoin(meeting._id)}
            variant="outline"
            className="w-full border-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 py-2 rounded-lg"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Enter Room</span>
          </Button>
        )}

        {meeting.status === 'completed' && (
          <>
            {onViewSummary && (
              <Button
                onClick={() => onViewSummary(meeting._id)}
                variant="outline"
                className="flex-1 border-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 py-2 rounded-lg"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>AI Summary</span>
              </Button>
            )}
            {meeting.recordingUrl && (
              <Button
                variant="outline"
                className="border-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center p-2 rounded-lg"
                title="Play Recording"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
