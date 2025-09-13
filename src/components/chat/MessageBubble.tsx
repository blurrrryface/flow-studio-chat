import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { User, Bot, Settings, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolDisplay } from "./ToolDisplay";
import { MarkdownRenderer } from "./MarkdownRenderer";

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
        if (message.metadata?.state === 'tool_calling') {
          return <Wrench className="h-4 w-4" />;
        }
        return <Settings className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    if (isUser) {
      return <span className="text-sm">{message.content}</span>;
    } else {
      return <MarkdownRenderer content={message.content} />;
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
          isSystem && message.metadata?.state === 'tool_calling' ? "bg-primary text-primary-foreground" :
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
          "rounded-lg px-4 py-2 transition-all duration-200",
          isUser && "chat-message-user",
          !isUser && !isSystem && "chat-message-assistant shadow-sm",
          isSystem && message.metadata?.state === 'tool_calling' ? "bg-primary/10 border border-primary/20" :
          isSystem && "chat-message-system",
          message.isStreaming && "animate-pulse-subtle"
        )}>
          {renderContent()}
          {message.isStreaming && (
            <span className="ml-2 streaming-dots"></span>
          )}
        </div>
        
        {/* Tool Display */}
        {((message.metadata?.tools && message.metadata.tools.length > 0) || 
          (message.metadata?.tool_calls && message.metadata.tool_calls.length > 0)) && (
          <ToolDisplay 
            tools={message.metadata.tools || message.metadata.tool_calls || []}
            state={message.metadata.state}
            className="max-w-full"
          />
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
          
          {message.metadata?.state && (
            <Badge variant="secondary" className="text-xs">
              {message.metadata.state === 'tool_calling' ? '工具调用中' : 
               message.metadata.state === 'generating' ? '生成中' :
               message.metadata.state === 'completed' ? '完成' :
               message.metadata.state}
            </Badge>
          )}
          
          {((message.metadata?.tools && message.metadata.tools.length > 0) || 
            (message.metadata?.tool_calls && message.metadata.tool_calls.length > 0)) && (
            <Badge variant="outline" className="text-xs">
              {(message.metadata.tools || message.metadata.tool_calls || []).length} 个工具
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