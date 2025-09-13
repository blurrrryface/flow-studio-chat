import { Thread } from "./thread";
import { AssistantUIProvider } from "./assistant-ui-provider";
import { ContextPanel } from "@/components/chat/ContextPanel";
import { APIConfigDialog } from "@/components/chat/APIConfigDialog";
import { Message as ChatMessage, ConversationState } from "@/types/chat";
import { LangGraphConfig, useLangGraphAPI } from "@/hooks/useLangGraphAPI";
import { useAssistantUIRuntime } from "@/hooks/useExternalStoreRuntime";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, RotateCcw, Sidebar } from "lucide-react";
import { toast } from "sonner";

interface EnhancedThreadProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onStopStreaming?: () => void;
  onNewSession?: () => void;
  conversationState?: ConversationState;
  className?: string;
}

export const EnhancedThread = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  onNewSession,
  conversationState,
  className
}: EnhancedThreadProps) => {
  const [showContext, setShowContext] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // API Configuration
  const [apiConfig, setApiConfig] = useState<LangGraphConfig>({
    baseUrl: "http://localhost:4578",
    graphId: "langgraph-app",
    apiKey: ""
  });
  
  const { sendMessage: sendToLangGraph, createSession, testConnection, isConnected } = useLangGraphAPI(apiConfig);

  // Enhanced send message with LangGraph integration
  const handleSendMessage = async (content: string) => {
    try {
      if (isConnected && currentSessionId) {
        await sendToLangGraph(content, currentSessionId);
      } else if (onSendMessage) {
        await onSendMessage(content);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleNewSession = async () => {
    try {
      if (isConnected) {
        const sessionId = await createSession();
        setCurrentSessionId(sessionId);
        toast.success("New session created");
      }
      onNewSession?.();
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create new session");
    }
  };

  const handleConfigChange = (newConfig: LangGraphConfig) => {
    setApiConfig(newConfig);
    setCurrentSessionId(null);
  };

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, [apiConfig]);

  const runtime = useAssistantUIRuntime({
    messages,
    isStreaming,
    onSendMessage: handleSendMessage,
    onStopStreaming
  });

  return (
    <AssistantUIProvider runtime={runtime}>
      <div className={`flex ${className}`}>
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">LangGraph Assistant</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <APIConfigDialog
                config={apiConfig}
                onConfigChange={handleConfigChange}
              />
              <Button variant="outline" size="sm" onClick={handleNewSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContext(!showContext)}
              >
                <Sidebar className="h-4 w-4 mr-2" />
                {showContext ? 'Hide' : 'Show'} Context
              </Button>
            </div>
          </div>
          
          {/* Main thread area */}
          <div className="flex-1">
            <Thread />
          </div>
        </div>
        
        {/* Context panel */}
        {conversationState && (
          <div className="w-80 border-l bg-muted/30">
            <ContextPanel
              conversationState={conversationState}
              isVisible={showContext}
              onBranchSelect={(branchId) => {
                console.log("Selected branch:", branchId);
                // Handle branch selection logic
              }}
            />
          </div>
        )}
      </div>
    </AssistantUIProvider>
  );
};