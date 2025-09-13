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

        // 先添加AI回复消息（最后一个位置）
        setMessages(prev => [...prev, assistantMessage]);

        await sendToLangGraph(content, currentSessionId, (chunk) => {
          if (chunk.content) {
            // 更新AI回复消息
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg, 
                    content: chunk.content,
                    isStreaming: !chunk.isComplete,
                    metadata: {
                      state: chunk.metadata?.state || (chunk.isComplete ? "completed" : "generating"),
                      memory: chunk.metadata?.memory,
                      tools: chunk.metadata?.tools || []
                    }
                  }
                : msg
            ));
          } else if (chunk.metadata?.tools && chunk.metadata.tools.length > 0) {
            // 处理工具调用信息
            chunk.metadata.tools.forEach((tool: any) => {
              // 如果工具已有结果，则更新现有工具调用消息
              if (tool.result && (tool.status === 'success' || tool.status === 'error')) {
                setMessages(prev => prev.map(msg => {
                  // 检查是否有对应的工具调用消息
                  if (msg.type === 'system' && msg.metadata?.tools) {
                    const updatedTools = msg.metadata.tools.map((t: any) => 
                      t.name === tool.name && t.status === 'pending'
                        ? { ...t, result: tool.result, status: tool.status }
                        : t
                    );
                    
                    return {
                      ...msg,
                      metadata: {
                        ...msg.metadata,
                        tools: updatedTools,
                        state: 'completed'
                      }
                    };
                  }
                  // 同时更新 assistantMessage 中的工具状态和完成状态
                  else if (msg.id === assistantMessage.id) {
                    return {
                      ...msg,
                      metadata: {
                        ...msg.metadata,
                        tools: chunk.metadata.tools || [],
                        state: 'completed'
                      }
                    };
                  }
                  return msg;
                }));
              } else if (tool.status === 'pending') {
                // 为每个新的工具调用创建单独的消息，但确保它们插入在AI回复消息之前
                const toolMessage: Message = {
                  id: `${Date.now()}-tool-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'system',
                  content: `正在调用工具: ${tool.name}`,
                  timestamp: new Date(),
                  metadata: {
                    state: 'tool_calling',
                    tools: [tool]
                  }
                };
                
                // 检查是否已有相同的工具调用消息，如果没有则添加到AI回复消息之前
                setMessages(prev => {
                  const existingToolCall = prev.find(
                    msg => msg.type === 'system' && 
                           msg.metadata?.tools?.some((t: any) => t.name === tool.name && t.status === 'pending')
                  );
                  
                  if (existingToolCall) {
                    return prev;
                  }
                  
                  // 找到AI回复消息的索引，将工具调用消息插入在它之前
                  const assistantIndex = prev.findIndex(msg => msg.id === assistantMessage.id);
                  if (assistantIndex > -1) {
                    const newMessages = [...prev];
                    newMessages.splice(assistantIndex, 0, toolMessage);
                    return newMessages;
                  }
                  
                  return prev;
                });
              }
            });
          } else if (chunk.metadata?.tool) {
            // 处理单个工具调用信息（后端返回的是单个tool字段）
            const tool = chunk.metadata.tool;
            
            // 如果工具已有结果，则更新现有工具调用消息
            if (tool.result && (tool.status === 'success' || tool.status === 'error')) {
              setMessages(prev => prev.map(msg => {
                // 检查是否有对应的工具调用消息
                if (msg.type === 'system' && msg.metadata?.tools) {
                  const updatedTools = msg.metadata.tools.map((t: any) => 
                    t.name === tool.name && t.status === 'pending'
                      ? { ...t, result: tool.result, status: tool.status }
                      : t
                  );
                  
                  return {
                    ...msg,
                    metadata: {
                      ...msg.metadata,
                      tools: updatedTools,
                      state: 'completed'
                    }
                  };
                }
                // 同时更新 assistantMessage 中的工具状态和完成状态
                else if (msg.id === assistantMessage.id) {
                  return {
                    ...msg,
                    isStreaming: false,
                    metadata: {
                      ...msg.metadata,
                      tools: [tool],
                      state: 'completed'
                    }
                  };
                }
                return msg;
              }));
            } else if (tool.status === 'pending') {
              // 为新的工具调用创建单独的消息，但确保它们插入在AI回复消息之前
              const toolMessage: Message = {
                id: `${Date.now()}-tool-${Math.random().toString(36).substr(2, 9)}`,
                type: 'system',
                content: `正在调用工具: ${tool.name}`,
                timestamp: new Date(),
                metadata: {
                  state: 'tool_calling',
                  tools: [tool]
                }
              };
              
              // 检查是否已有相同的工具调用消息，如果没有则添加到AI回复消息之前
              setMessages(prev => {
                const existingToolCall = prev.find(
                  msg => msg.type === 'system' && 
                         msg.metadata?.tools?.some((t: any) => t.name === tool.name && t.status === 'pending')
                );
                
                if (existingToolCall) {
                  return prev;
                }
                
                // 找到AI回复消息的索引，将工具调用消息插入在它之前
                const assistantIndex = prev.findIndex(msg => msg.id === assistantMessage.id);
                if (assistantIndex > -1) {
                  const newMessages = [...prev];
                  newMessages.splice(assistantIndex, 0, toolMessage);
                  return newMessages;
                }
                
                return prev;
              });
            }
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
    
    // Create initial assistant message
    const assistantMessage: Message = {
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

    // 先添加AI回复消息（最后一个位置）
    setMessages(prev => [...prev, assistantMessage]);

    // 创建模拟的工具调用消息（独立的消息框），但确保它们插入在AI回复消息之前
    const tool1: Message = {
      id: `${Date.now()}-tool1`,
      type: 'system',
      content: "正在调用知识库工具...",
      timestamp: new Date(),
      metadata: {
        state: 'tool_calling',
        tools: [{ name: "knowledge_base", status: "pending" as const }]
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => {
      const assistantIndex = prev.findIndex(msg => msg.id === assistantMessage.id);
      if (assistantIndex > -1) {
        const newMessages = [...prev];
        newMessages.splice(assistantIndex, 0, tool1);
        return newMessages;
      }
      return prev;
    });

    // 更新工具状态为完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => prev.map(msg => 
      msg.id === tool1.id 
        ? { 
            ...msg, 
            metadata: {
              ...msg.metadata,
              state: "completed",
              tools: [{ name: "knowledge_base", status: "success" as const, result: "知识库查询结果示例" }]
            }
          } 
        : msg
    ));

    // 创建第二个工具调用消息
    const tool2: Message = {
      id: `${Date.now()}-tool2`,
      type: 'system',
      content: "正在调用代码生成工具...",
      timestamp: new Date(),
      metadata: {
        state: 'tool_calling',
        tools: [{ name: "code_generation", status: "pending" as const }]
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => {
      const assistantIndex = prev.findIndex(msg => msg.id === assistantMessage.id);
      if (assistantIndex > -1) {
        const newMessages = [...prev];
        newMessages.splice(assistantIndex, 0, tool2);
        return newMessages;
      }
      return prev;
    });

    // 更新第二个工具状态为完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => prev.map(msg => 
      msg.id === tool2.id 
        ? { 
            ...msg, 
            metadata: {
              ...msg.metadata,
              state: "completed",
              tools: [{ name: "code_generation", status: "success" as const, result: "代码生成结果示例" }]
            }
          } 
        : msg
    ));

    // 流式显示AI回复
    let currentContent = "";
    for (let i = 0; i < fullResponse.length; i++) {
      currentContent += fullResponse[i];
      await new Promise(resolve => setTimeout(resolve, 20));
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: currentContent } 
          : msg
      ));
    }

    // 标记AI回复为完成
    setMessages(prev => prev.map(msg => 
      msg.id === assistantMessage.id 
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