import { cn } from '@/utils/cn';
import { ChatMessage } from '@/services/chat.api';

interface MessageProps {
  message: ChatMessage;
  isSelf: boolean;
  senderName: string;
}

export default function Message({ message, isSelf, senderName }: MessageProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'flex flex-col max-w-[85%] rounded-xl p-3 text-sm shadow-sm transition-all duration-200 animate-fade-in',
        isSelf
          ? 'ml-auto bg-primary text-primary-foreground rounded-br-none'
          : 'bg-slate-950/40 text-slate-100 border border-slate-800/80 rounded-bl-none'
      )}
    >
      {!isSelf && (
        <span className="text-[10px] font-semibold text-slate-400 mb-1 select-none">
          {senderName}
        </span>
      )}
      <p className="leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
      <span className="text-[9px] opacity-60 self-end mt-1 select-none">
        {formattedTime}
      </span>
    </div>
  );
}
