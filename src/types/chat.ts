export interface ToolCall {
  name: string;
  args?: Record<string, any>;
  result?: any;
  status?: 'pending' | 'success' | 'error';
}

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'tool_call'; // 添加新的消息类型
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    state?: string;
    branch?: string;
    memory?: Record<string, any>;
    tools?: ToolCall[];
    tool_calls?: ToolCall[]; // Alternative naming from backend
  };
}

export interface ConversationState {
  id: string;
  currentState: string;
  memory: Record<string, any>;
  branches: string[];
  metadata: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  state: ConversationState;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  metadata?: {
    state?: string;
    memory?: Record<string, any>;
    tools?: ToolCall[];
  };
}