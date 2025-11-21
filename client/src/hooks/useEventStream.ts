import { useCallback, useEffect, useRef, useState } from "react";

export type EventStreamStatus = "idle" | "connecting" | "open" | "error" | "fallback";

export interface EventStreamOptions {
  url: string | null;
  eventHandlers?: Record<string, (event: MessageEvent) => void>;
  onOpen?: () => void;
  onError?: (event: Event) => void;
  onReconnectAttempt?: (attempt: number) => void;
  onFallback?: () => void;
  maxReconnectAttempts?: number;
  baseReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
}

export interface EventStreamController {
  status: EventStreamStatus;
  reconnectAttempts: number;
  close: () => void;
}

export function useEventStream({
  url,
  eventHandlers = {},
  onOpen,
  onError,
  onReconnectAttempt,
  onFallback,
  maxReconnectAttempts = 5,
  baseReconnectDelayMs = 1000,
  maxReconnectDelayMs = 30000,
}: EventStreamOptions): EventStreamController {
  const [status, setStatus] = useState<EventStreamStatus>("idle");
  const eventSourceRef = useRef<EventSource | null>(null);
  const connectRef = useRef<() => void>(() => {});
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setStatus("fallback");
      onFallback?.();
      return;
    }

    const delay = Math.min(
      baseReconnectDelayMs * Math.pow(2, reconnectAttemptsRef.current),
      maxReconnectDelayMs
    );
    reconnectAttemptsRef.current += 1;
    onReconnectAttempt?.(reconnectAttemptsRef.current);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectRef.current();
    }, delay);
  }, [
    baseReconnectDelayMs,
    maxReconnectAttempts,
    maxReconnectDelayMs,
    onFallback,
    onReconnectAttempt,
  ]);

  const connect = useCallback(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    cleanup();
    setStatus("connecting");

    const source = new EventSource(url);
    eventSourceRef.current = source;

    source.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("open");
      onOpen?.();
    };

    source.onerror = (event) => {
      setStatus("error");
      onError?.(event);
      cleanup();
      scheduleReconnect();
    };

    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      if (eventName === "message") {
        source.onmessage = handler;
      } else {
        source.addEventListener(eventName, handler);
      }
    });
  }, [cleanup, eventHandlers, onError, onOpen, scheduleReconnect, url]);

  connectRef.current = connect;

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return {
    status,
    reconnectAttempts: reconnectAttemptsRef.current,
    close: cleanup,
  };
}


