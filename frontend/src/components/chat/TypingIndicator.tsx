interface TypingIndicatorProps {
  typingUsers: Set<string>;
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const usersArray = Array.from(typingUsers);
  if (usersArray.length === 0) return null;

  const getIndicatorText = () => {
    if (usersArray.length === 1) {
      return `${usersArray[0].substring(0, 8)} is typing...`;
    }
    if (usersArray.length === 2) {
      return `${usersArray[0].substring(0, 8)} and ${usersArray[1].substring(0, 8)} are typing...`;
    }
    return 'Several people are typing...';
  };

  return (
    <div className="text-xs text-slate-400 italic flex items-center gap-1.5 px-1 animate-fade-in select-none">
      <span className="flex gap-0.5 items-center mt-1">
        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{getIndicatorText()}</span>
    </div>
  );
}
