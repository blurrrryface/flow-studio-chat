import React from "react";
import { GraphStateSidebar } from "@/components/sidebar/GraphStateSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConversationState, Message } from "@/types/chat";

const Index = () => {
  console.log("Index component starting to render");
  
  // Start with simple state
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
      ui_mode: "simple"
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

  console.log("About to render Index JSX");

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
                LangGraph Chat Interface (Simple Mode)
              </h1>
            </div>
          </div>
        </header>

        {/* Main chat area - temporarily simplified */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-lg font-semibold mb-2">Chat Interface Loading...</h2>
            <p className="text-muted-foreground">Messages: {messages.length}</p>
            <p className="text-muted-foreground">Streaming: {isStreaming.toString()}</p>
            <button 
              onClick={() => console.log("Test button clicked")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Test Button
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
