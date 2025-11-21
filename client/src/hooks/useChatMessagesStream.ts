import { useEffect, useRef } from 'react';
import { Message } from '@/shared/schema';
import { getUserEmail } from '@/utils/userStorage';

interface UseChatMessagesStreamProps {
  sessionId: string | null;
  onNewMessages: (messages: Message[]) => void;
  enabled?: boolean;
}

export const useChatMessagesStream = ({
  sessionId,
  onNewMessages,
  enabled = true,
}: UseChatMessagesStreamProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!sessionId || !enabled) {
      return;
    }

    const userEmail = getUserEmail();
    if (!userEmail) {
      return;
    }

    // Get API base URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD 
        ? (typeof window !== 'undefined' ? window.location.origin : 'https://marico-insight-safe.vercel.app')
        : 'http://localhost:3002');

    const connectSSE = () => {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Build SSE URL
      const sseUrl = `${API_BASE_URL}/api/chat/${sessionId}/stream?username=${encodeURIComponent(userEmail)}`;
      
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      eventSource.addEventListener('init', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Initial load - could use this to sync if needed
        } catch (err) {
          console.error('Failed to parse SSE init data:', err);
        }
      });

      eventSource.addEventListener('messages', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.messages && Array.isArray(data.messages)) {
            onNewMessages(data.messages);
          }
          reconnectAttemptsRef.current = 0;
        } catch (err) {
          console.error('Failed to parse SSE messages data:', err);
        }
      });

      eventSource.addEventListener('error', (event) => {
        console.error('SSE error event:', event);
      });

      eventSource.onerror = (error) => {
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE();
          }, delay);
        }
      };
    };

    // Initial connection
    connectSSE();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [sessionId, enabled, onNewMessages]);
};

