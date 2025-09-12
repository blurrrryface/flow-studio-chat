import React from "react";
import { MarkdownText } from "./markdown-text";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface SimpleThreadProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const SimpleThread: React.FC<SimpleThreadProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading = false 
}) => {
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground">Ask me anything!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.role === 'assistant' ? (
                  <MarkdownText content={message.content} />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
            <SendHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};