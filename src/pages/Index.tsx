import React from "react";
import { EnhancedThread } from "@/components/assistant-ui/enhanced-thread";
import { GraphStateSidebar } from "@/components/sidebar/GraphStateSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConversationState, Message } from "@/types/chat";

const Index = () => {
  console.log("Index component starting to render");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  console.log("Index component state initialized, messages:", messages.length);

  // Mock conversation state for demonstration
  const [conversationState] = React.useState<ConversationState>({
    id: "session-123456789",
    currentState: "agent_thinking", 
    memory: {
      user_intent: "weather_query",
      location: "beijing",
      context_count: 3,
      ui_mode: "assistant-ui"
    },
    branches: ["search", "generate", "validate"],
    metadata: {
      start_time: Date.now(),
      node_count: 5
    }
  });

  const [currentNode] = React.useState("search_node");

  const [branches] = React.useState([
    { id: "1", name: "search_tools", status: "completed" as const },
    { id: "2", name: "weather_api", status: "active" as const },
    { id: "3", name: "response_gen", status: "pending" as const },
    { id: "4", name: "validation", status: "pending" as const }
  ]);

  const handleSendMessage = async (message: string) => {
    console.log("Sending message to LangGraph:", message);
    // This would integrate with your actual LangGraph backend
    // For demonstration, we'll simulate a response with markdown and tool calls
  };

  const handleNewSession = () => {
    console.log("Starting new session");
    setMessages([]);
    setIsStreaming(false);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      <GraphStateSidebar
        conversationState={conversationState}
        currentNode={currentNode}
        branches={branches}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header with sidebar trigger */}
        <header className="h-12 flex items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-sm font-semibold">
                LangGraph Chat Interface (Assistant UI)
              </h1>
            </div>
          </div>
        </header>

        {/* Main chat area */}
        <main className="flex-1">
          <EnhancedThread
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onStopStreaming={handleStopStreaming}
            onNewSession={handleNewSession}
            conversationState={conversationState}
            className="h-full"
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
