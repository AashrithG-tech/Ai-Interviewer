import { Message } from "@/types/interview";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isEncouraging?: boolean;
}

export const ChatMessage = ({ message, isEncouraging }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm",
          isUser
            ? "bg-gradient-primary text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "flex flex-col gap-1 rounded-2xl px-4 py-3 max-w-[80%] shadow-card",
          isUser
            ? "bg-gradient-primary text-primary-foreground"
            : "bg-card text-card-foreground border border-border",
          isEncouraging && !isUser && "ring-2 ring-accent shadow-soft"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-60">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};
