import { AssistantRuntimeProvider } from "@assistant-ui/react";

interface AssistantUIProviderProps {
  children: React.ReactNode;
  runtime: any; // Accept runtime as prop instead of creating it
}

export const AssistantUIProvider = ({ children, runtime }: AssistantUIProviderProps) => {
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};