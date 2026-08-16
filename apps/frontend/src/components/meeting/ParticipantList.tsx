import { ParticipantState } from '@/types/webrtc.types';
import { Mic, MicOff, Video, VideoOff, Monitor, X } from 'lucide-react';

interface ParticipantListProps {
  localUsername: string;
  localAudioMuted: boolean;
  localVideoMuted: boolean;
  localScreenSharing: boolean;
  participants: Map<string, ParticipantState>;
  onClose: () => void;
}

export default function ParticipantList({
  localUsername,
  localAudioMuted,
  localVideoMuted,
  localScreenSharing,
  participants,
  onClose,
}: ParticipantListProps) {
  const remoteParticipants = Array.from(participants.values());

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-md font-semibold text-white">Participants ({1 + remoteParticipants.length})</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Local user */}
        <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
              {localUsername.substring(0, 2)}
            </div>
            <span className="text-sm font-medium text-white truncate max-w-[120px]">
              {localUsername} <span className="text-xs text-slate-400">(You)</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {localScreenSharing && <Monitor className="h-4 w-4 text-primary" />}
            {localAudioMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
            {localVideoMuted ? <VideoOff className="h-4 w-4 text-red-400" /> : <Video className="h-4 w-4" />}
          </div>
        </div>

        {/* Remote users */}
        {remoteParticipants.map((p) => {
          const name = p.userId.substring(0, 8);
          return (
            <div key={p.userId} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs uppercase">
                  {name.substring(0, 2)}
                </div>
                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                {p.screenSharing && <Monitor className="h-4 w-4 text-primary" />}
                {p.audioMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
                {p.videoMuted ? <VideoOff className="h-4 w-4 text-red-400" /> : <Video className="h-4 w-4" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
