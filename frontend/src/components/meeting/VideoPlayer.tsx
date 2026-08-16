import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface VideoPlayerProps {
  stream: MediaStream | null;
  username: string;
  isLocal?: boolean;
  audioMuted?: boolean;
  videoMuted?: boolean;
  className?: string;
}

export default function VideoPlayer({
  stream,
  username,
  isLocal = false,
  audioMuted = false,
  videoMuted = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-lg aspect-video flex items-center justify-center transition-all duration-300 group',
        className
      )}
    >
      {/* Video display */}
      {stream && !videoMuted ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Avoid local user audio feedback loop
          className="h-full w-full object-cover rounded-xl"
        />
      ) : (
        /* Avatar Placeholder when video is disabled */
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-2xl font-bold uppercase ring-4 ring-primary/20 transition-all duration-300 group-hover:scale-105">
          {username.substring(0, 2)}
        </div>
      )}

      {/* Control indicators and Overlay info */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span className="rounded-md bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white border border-slate-800">
          {username} {isLocal && '(You)'}
        </span>
        <div className="flex gap-1.5">
          {audioMuted && (
            <span className="rounded-md bg-red-500/20 backdrop-blur-md p-1 border border-red-500/30 text-red-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </span>
          )}
          {videoMuted && (
            <span className="rounded-md bg-red-500/20 backdrop-blur-md p-1 border border-red-500/30 text-red-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
