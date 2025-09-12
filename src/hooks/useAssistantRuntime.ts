import { useLocalRuntime } from "@assistant-ui/react";
import { useLangGraphAPI } from "@/hooks/useLangGraphAPI";
import { useState } from "react";

export const useAssistantRuntime = () => {
  const { sendMessage, isConnected, isStreaming } = useLangGraphAPI({
    baseUrl: "http://localhost:8000",
    graphId: "langraph-chat"
  });
  
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const runtime = useLocalRuntime({
    async run({ messages, abortSignal }) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== "user") return;

      const content = lastMessage.content
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("");

      let fullResponse = "";
      
      try {
        await sendMessage(content, sessionId, (chunk) => {
          fullResponse += chunk.content;
        });
      } catch (error) {
        console.error("Error sending message:", error);
        fullResponse = "Sorry, I encountered an error processing your message.";
      }

      return {
        content: [{ type: "text", text: fullResponse }],
      };
    },
  });

  return runtime;
};