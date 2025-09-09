import { ChatInterface } from "@/components/chat/ChatInterface";

const Index = () => {
  const handleSendMessage = async (message: string) => {
    // This would integrate with your LangGraph backend
    // For now, it's handled by the ChatInterface's demo mode
    console.log("Sending message to LangGraph:", message);
  };

  const handleNewSession = () => {
    console.log("Starting new session");
  };

  return (
    <div className="h-screen w-full">
      <ChatInterface
        onSendMessage={handleSendMessage}
        onNewSession={handleNewSession}
      />
    </div>
  );
};

export default Index;
