import { useState, useCallback, useRef } from 'react';
import { Client } from '@langchain/langgraph-sdk';
import { Message, StreamingResponse } from '@/types/chat';

export interface LangGraphConfig {
  baseUrl: string;
  apiKey?: string;
  graphId: string;
}

export const useLangGraphAPI = (config: LangGraphConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Initialize client
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new Client({
        apiUrl: config.baseUrl || 'http://localhost:8123',
        ...(config.apiKey && { apiKey: config.apiKey })
      });
    }
    return clientRef.current;
  }, [config]);

  const sendMessage = useCallback(async (
    message: string,
    sessionId: string,
    onStreamChunk?: (chunk: StreamingResponse) => void
  ) => {
    setIsStreaming(true);
    
    try {
      const client = getClient();
      
      // Find assistant by graph_id
      const assistants = await client.assistants.search({ 
        metadata: { graph_id: config.graphId },
        limit: 1 
      });
      
      if (!assistants || assistants.length === 0) {
        throw new Error(`No assistant found for graph_id: ${config.graphId}`);
      }
      
      const assistant = assistants[0];
      
      // Create or get existing thread
      const streamResponse = client.runs.stream(
        sessionId,
        assistant.assistant_id,
        {
          input: { messages: [{ role: "human", content: message }] },
        }
      );

      let accumulatedContent = '';
      for await (const chunk of streamResponse) {
        if (chunk.event === 'messages/partial' && chunk.data) {
          // Handle array of messages
          const messages = Array.isArray(chunk.data) ? chunk.data : [chunk.data];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.content) {
            // Convert MessageContent to string
            const content = typeof lastMessage.content === 'string' 
              ? lastMessage.content 
              : Array.isArray(lastMessage.content) 
                ? lastMessage.content.map(c => {
                    if (typeof c === 'string') return c;
                    if (typeof c === 'object' && c !== null) {
                      // Handle MessageContentComplex - try common properties
                      return (c as any).text || (c as any).content || JSON.stringify(c);
                    }
                    return String(c);
                  }).join('')
                : String(lastMessage.content);
            accumulatedContent = content;
            onStreamChunk?.({
              content: accumulatedContent,
              isComplete: false
            });
          }
        } else if (chunk.event === 'messages/complete' && chunk.data) {
          const messages = Array.isArray(chunk.data) ? chunk.data : [chunk.data];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.content) {
            const content = typeof lastMessage.content === 'string' 
              ? lastMessage.content 
              : Array.isArray(lastMessage.content) 
                ? lastMessage.content.map(c => {
                    if (typeof c === 'string') return c;
                    if (typeof c === 'object' && c !== null) {
                      // Handle MessageContentComplex - try common properties
                      return (c as any).text || (c as any).content || JSON.stringify(c);
                    }
                    return String(c);
                  }).join('')
                : String(lastMessage.content);
            onStreamChunk?.({
              content: content,
              isComplete: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, [config, getClient]);

  const createSession = useCallback(async () => {
    try {
      const client = getClient();
      const thread = await client.threads.create({
        metadata: { graph_id: config.graphId }
      });
      return thread.thread_id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [config, getClient]);

  const getSessionState = useCallback(async (sessionId: string) => {
    try {
      const client = getClient();
      const state = await client.threads.getState(sessionId);
      return state;
    } catch (error) {
      console.error('Error getting session state:', error);
      throw error;
    }
  }, [getClient]);

  const testConnection = useCallback(async () => {
    try {
      const client = getClient();
      // Test by trying to list assistants
      await client.assistants.search({ limit: 1 });
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      return false;
    }
  }, [getClient]);

  return {
    sendMessage,
    createSession,
    getSessionState,
    testConnection,
    isConnected,
    isStreaming
  };
};