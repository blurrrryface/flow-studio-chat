import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { User, Bot, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  const getIcon = () => {
    switch (message.type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "flex w-full gap-3 mb-4 animate-slide-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
          isSystem ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"
        )}>
          {getIcon()}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col space-y-1 max-w-[70%]",
        isUser && "items-end"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm transition-all duration-200",
          isUser && "chat-message-user",
          !isUser && !isSystem && "chat-message-assistant shadow-sm",
          isSystem && "chat-message-system",
          message.isStreaming && "animate-pulse-subtle"
        )}>
          {message.content}
          {message.isStreaming && (
            <span className="ml-2 streaming-dots"></span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
          
          {message.metadata?.state && (
            <Badge variant="secondary" className="text-xs">
              {message.metadata.state}
            </Badge>
          )}
          
          {message.metadata?.tools && message.metadata.tools.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {message.metadata.tools.length} tools
            </Badge>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-chat-user text-chat-user-foreground">
          {getIcon()}
        </div>
      )}
    </div>
  );
};