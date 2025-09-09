import { useState, useCallback } from 'react';
import { Message, StreamingResponse } from '@/types/chat';

export interface LangGraphConfig {
  baseUrl: string;
  apiKey?: string;
  graphId: string;
}

export const useLangGraphAPI = (config: LangGraphConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (
    message: string,
    sessionId: string,
    onStreamChunk?: (chunk: StreamingResponse) => void
  ) => {
    setIsStreaming(true);
    
    try {
      const response = await fetch(`${config.baseUrl}/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({
          input: {
            message,
            session_id: sessionId,
            graph_id: config.graphId
          },
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onStreamChunk?.(data);
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, [config]);

  const createSession = useCallback(async () => {
    try {
      const response = await fetch(`${config.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({
          graph_id: config.graphId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const session = await response.json();
      return session.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [config]);

  const getSessionState = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${config.baseUrl}/sessions/${sessionId}/state`, {
        headers: {
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session state:', error);
      throw error;
    }
  }, [config]);

  const testConnection = useCallback(async () => {
    try {
      const response = await fetch(`${config.baseUrl}/health`, {
        headers: {
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      });
      
      setIsConnected(response.ok);
      return response.ok;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, [config]);

  return {
    sendMessage,
    createSession,
    getSessionState,
    testConnection,
    isConnected,
    isStreaming
  };
};