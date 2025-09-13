import { Thread } from "./thread";
import { AssistantUIProvider } from "./assistant-ui-provider";
import { Message as ChatMessage } from "@/types/chat";
import { useAssistantUIRuntime } from "@/hooks/useExternalStoreRuntime";

interface EnhancedThreadProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onStopStreaming?: () => void;
  className?: string;
}

export const EnhancedThread = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  className
}: EnhancedThreadProps) => {
  const runtime = useAssistantUIRuntime({
    messages,
    isStreaming,
    onSendMessage,
    onStopStreaming
  });

  return (
    <AssistantUIProvider runtime={runtime}>
      <div className={className}>
        <Thread />
      </div>
    </AssistantUIProvider>
  );
};