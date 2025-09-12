import { useLocalRuntime } from "@assistant-ui/react";

export const useAssistantRuntime = () => {
  const runtime = useLocalRuntime({
    async run({ messages, abortSignal }) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== "user") return;

      const content = lastMessage.content
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("");

      // Simple echo response for now - you can integrate LangGraph here later
      const response = `Echo: ${content}`;

      return {
        content: [{ type: "text", text: response }],
      };
    },
  });

  return runtime;
};