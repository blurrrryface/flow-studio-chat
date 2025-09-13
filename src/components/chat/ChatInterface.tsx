import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ContextPanel } from "./ContextPanel";
import { APIConfigDialog } from "./APIConfigDialog";
import { Message, ChatSession, ConversationState } from "@/types/chat";
import { LangGraphConfig, useLangGraphAPI } from "@/hooks/useLangGraphAPI";
import { Sidebar, MessageSquare, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInterfaceProps {
  session?: ChatSession;
  onSendMessage?: (message: string) => Promise<void>;
  onNewSession?: () => void;
  className?: string;
}

export const ChatInterface = ({
  session,
  onSendMessage,
  onNewSession,
  className
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(session?.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // API Configuration
  const [apiConfig, setApiConfig] = useState<LangGraphConfig>({
    baseUrl: "http://localhost:4578",
    graphId: "langgraph-app",
    apiKey: ""
  });
  
  const { sendMessage: sendToLangGraph, createSession, testConnection, isConnected } = useLangGraphAPI(apiConfig);
  
  // Mock conversation state for demo
  const [conversationState, setConversationState] = useState<ConversationState>({
    id: "demo-state",
    currentState: "waiting_for_input",
    memory: {
      "user_name": "用户",
      "conversation_topic": "LangGraph前端开发",
      "last_query": "如何构建前端界面"
    },
    branches: ["continue_conversation", "change_topic", "ask_clarification"],
    metadata: {
      "session_length": "5 minutes",
      "message_count": messages.length,
      "api_connected": isConnected
    }
  });

  useEffect(() => {
    if (session) {
      setMessages(session.messages);
    }
  }, [session]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  // Update conversation state when messages change
  useEffect(() => {
    setConversationState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        "message_count": messages.length,
        "api_connected": isConnected
      }
    }));
  }, [messages.length, isConnected]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      if (isConnected && currentSessionId) {
        // Use real LangGraph API
        let assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "",
          timestamp: new Date(),
          isStreaming: true,
          metadata: {
            state: "generating",
            tools: []
          }
        };

        setMessages(prev => [...prev, assistantMessage]);

        await sendToLangGraph(content, currentSessionId, (chunk) => {
          if (chunk.content) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg, 
                    content: chunk.content,
                    isStreaming: !chunk.isComplete,
                    metadata: {
                      state: chunk.metadata?.state || "generating",
                      memory: chunk.metadata?.memory,
                      tools: chunk.metadata?.tools || []
                    }
                  }
                : msg
            ));
          } else if (chunk.metadata) {
            // Handle metadata-only updates (like tool calling status)
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg,
                    metadata: {
                      state: chunk.metadata?.state || "generating",
                      memory: chunk.metadata?.memory,
                      tools: chunk.metadata?.tools || []
                    }
                  }
                : msg
            ));
          }
        });
      } else if (onSendMessage) {
        await onSendMessage(content);
      } else {
        // Mock streaming response for demo
        await simulateStreamingResponse(content);
      }
    } catch (error) {
      toast.error("发送消息失败: " + (error as Error).message);
      console.error(error);
    } finally {
      setIsStreaming(false);
    }
  };

  const simulateStreamingResponse = async (userMessage: string) => {
    const responses = [
      "我理解您想要为LangGraph应用构建一个现代化的前端界面。",
      "基于您的需求，这个界面需要支持流式操作和复杂的对话流程管理。",
      "我们可以使用React + TypeScript来构建，并集成WebSocket来处理实时通信。",
      "同时，我们还可以添加状态管理来追踪对话分支和记忆系统。"
    ];

    const fullResponse = responses.join(" ");
    
    // Create streaming message
    const streamingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        state: "generating",
        tools: [
          { name: "knowledge_base", status: "pending" as const },
          { name: "code_generation", status: "pending" as const }
        ]
      }
    };

    setMessages(prev => [...prev, streamingMessage]);

    // Simulate streaming
    let currentContent = "";
    for (let i = 0; i < fullResponse.length; i++) {
      currentContent += fullResponse[i];
      await new Promise(resolve => setTimeout(resolve, 20));
      
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessage.id 
          ? { ...msg, content: currentContent }
          : msg
      ));
    }

    // Mark as complete
    setMessages(prev => prev.map(msg => 
      msg.id === streamingMessage.id 
        ? { 
            ...msg, 
            isStreaming: false,
            metadata: {
              ...msg.metadata,
              state: "completed"
            }
          }
        : msg
    ));
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    toast.info("已停止生成");
  };

  const handleNewSession = async () => {
    setMessages([]);
    setIsStreaming(false);
    
    try {
      // Test connection first, but don't fail if it's not available
      const connected = await testConnection();
      
      if (connected) {
        const sessionId = await createSession();
        setCurrentSessionId(sessionId);
        toast.success("已创建新会话并连接到 LangGraph");
      } else {
        setCurrentSessionId(null);
        toast.info("无法连接到 LangGraph 后端，使用演示模式");
      }
    } catch (error) {
      // Handle any unexpected errors gracefully
      setCurrentSessionId(null);
      toast.info("无法连接到 LangGraph 后端，使用演示模式");
    }
    
    if (onNewSession) {
      onNewSession();
    }
  };

  const handleBranchSelect = (branch: string) => {
    // TODO: 实现分支切换逻辑，可能需要调用 API 切换到指定分支
    console.log('切换到分支:', branch);
    toast.info(`切换到分支: ${branch}`);
    
    // 更新当前状态
    setConversationState(prev => ({
      ...prev,
      currentState: branch
    }));
  };

  const handleConfigChange = (newConfig: LangGraphConfig) => {
    setApiConfig(newConfig);
    setCurrentSessionId(null); // Reset session when config changes
  };

  // Initialize session on component mount
  useEffect(() => {
    handleNewSession();
  }, []);

  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">LangGraph 对话助手</h1>
            {isConnected && (
              <span className="text-xs text-success font-medium">● 已连接</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <APIConfigDialog 
              config={apiConfig}
              onConfigChange={handleConfigChange}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              新对话
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContext(!showContext)}
              className="gap-2"
            >
              <Sidebar className="h-4 w-4" />
              上下文
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">欢迎使用 LangGraph 助手</h3>
                <p className="text-muted-foreground max-w-md">
                  这是一个支持流式操作和复杂对话流程的智能助手界面。您可以开始与AI进行多轮对话，系统会自动管理上下文和记忆。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          placeholder="输入您的消息，支持多轮对话和复杂流程..."
        />
      </div>

      {/* Context Panel */}
      <ContextPanel 
        conversationState={conversationState}
        isVisible={showContext}
        onBranchSelect={handleBranchSelect}
      />
    </div>
  );
};