import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAssistantRuntime } from "@/hooks/useAssistantRuntime";

interface AssistantUIProviderProps {
  children: React.ReactNode;
}

export const AssistantUIProvider = ({ children }: AssistantUIProviderProps) => {
  const runtime = useAssistantRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};