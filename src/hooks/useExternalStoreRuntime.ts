import { useExternalStoreRuntime } from "@assistant-ui/react";
import { useState, useCallback } from "react";
import { Message as ChatMessage, ToolCall } from "@/types/chat";
import type { AppendMessage, ThreadMessageLike } from "@assistant-ui/react";

// Convert our Message format to assistant-ui format
const convertMessage = (message: ChatMessage): ThreadMessageLike => {
  if (message.type === 'user') {
    return {
      id: message.id,
      role: "user" as const,
      content: [{ type: "text" as const, text: message.content }],
      createdAt: message.timestamp
    };
  }

  if (message.type === 'assistant') {
    const content: any[] = [];
    
    if (message.content) {
      content.push({ type: "text" as const, text: message.content });
    }

    // Add tool calls if present
    if (message.metadata?.tools && message.metadata.tools.length > 0) {
      message.metadata.tools.forEach((tool: ToolCall) => {
        content.push({
          type: "tool-call" as const,
          toolCallId: `${message.id}-${tool.name}`,
          toolName: tool.name,
          args: tool.args || {}
        });

        if (tool.result && (tool.status === 'success' || tool.status === 'error')) {
          content.push({
            type: "tool-result" as const,
            toolCallId: `${message.id}-${tool.name}`,
            result: tool.result,
            isError: tool.status === 'error'
          });
        }
      });
    }

    return {
      id: message.id,
      role: "assistant" as const,
      content,
      createdAt: message.timestamp,
      status: message.isStreaming ? { type: "running" as const } : { type: "complete" as const, reason: "stop" as const }
    };
  }

  // Handle system/tool messages as assistant messages with special formatting
  if (message.type === 'system' || message.type === 'tool_call') {
    return {
      id: message.id,
      role: "assistant" as const,
      content: [{ type: "text" as const, text: message.content }],
      createdAt: message.timestamp,
      status: { type: "complete" as const, reason: "stop" as const }
    };
  }

  // Default fallback
  return {
    id: message.id,
    role: "assistant" as const,
    content: [{ type: "text" as const, text: message.content || "" }],
    createdAt: message.timestamp,
    status: { type: "complete" as const, reason: "stop" as const }
  };
};

interface ExternalStoreRuntimeProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onStopStreaming?: () => void;
}

export const useAssistantUIRuntime = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming
}: ExternalStoreRuntimeProps) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleSend = useCallback(async (message: AppendMessage) => {
    if (message.content[0]?.type !== "text") {
      throw new Error("Only text messages are supported");
    }
    
    const text = message.content[0].text;
    setIsRunning(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsRunning(false);
    }
  }, [onSendMessage]);

  const handleCancel = useCallback(async () => {
    setIsRunning(false);
    onStopStreaming?.();
  }, [onStopStreaming]);

  // Create the runtime using useExternalStoreRuntime with proper configuration
  const runtime = useExternalStoreRuntime({
    isRunning: isStreaming || isRunning,
    messages,
    convertMessage,
    onNew: handleSend,
    onCancel: handleCancel,
    onEdit: async (message: AppendMessage) => {
      if (message.content[0]?.type === "text") {
        await onSendMessage(message.content[0].text);
      }
    },
    onReload: async (parentId?: string) => {
      // Handle message regeneration
      if (parentId) {
        const parentMessage = messages.find(m => m.id === parentId);
        if (parentMessage && parentMessage.type === 'user') {
          await onSendMessage(parentMessage.content);
        }
      }
    }
  });

  return runtime;
};