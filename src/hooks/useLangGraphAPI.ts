import { useState, useCallback } from 'react';
import { StreamingResponse } from '@/types/chat';

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

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                // Handle both "data: {...}" and "data: data: {...}" formats
                let jsonStr = line.slice(6);
                if (jsonStr.startsWith('data: ')) {
                  jsonStr = jsonStr.slice(6);
                }
                
                const data = JSON.parse(jsonStr);
                if (data.content !== undefined) {
                  // For typewriter effect, append new content to accumulated content
                  accumulatedContent ++= data.content;
                  onStreamChunk?.({
                    content: accumulatedContent,
                    isComplete: data.isComplete || false,
                    metadata: data.metadata
                  });
                }
              } catch (e) {
                console.warn('Failed to parse streaming data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark as complete if not already
      onStreamChunk?.({
        content: accumulatedContent,
        isComplete: true
      });

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

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [config]);

  const getSessionState = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${config.baseUrl}/sessions/${sessionId}/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${config.baseUrl}/health`);
      if (response.ok) {
        setIsConnected(true);
        return true;
      } else {
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
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