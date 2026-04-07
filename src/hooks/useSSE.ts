"use client";

import { useEffect, useRef, useCallback } from "react";

type SSEHandler = (event: string, data: unknown) => void;

export function useSSE(handlers: Record<string, SSEHandler>) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (eventSourceRef.current) return;

    const es = new EventSource("/api/events");
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      console.log("SSE connected");
    });

    es.addEventListener("new_message", (e) => {
      handlersRef.current.new_message?.("new_message", JSON.parse(e.data));
    });

    es.addEventListener("new_session", (e) => {
      handlersRef.current.new_session?.("new_session", JSON.parse(e.data));
    });

    es.addEventListener("session_response", (e) => {
      handlersRef.current.session_response?.(
        "session_response",
        JSON.parse(e.data)
      );
    });

    es.addEventListener("new_poll", (e) => {
      handlersRef.current.new_poll?.("new_poll", JSON.parse(e.data));
    });

    es.addEventListener("poll_vote", (e) => {
      handlersRef.current.poll_vote?.("poll_vote", JSON.parse(e.data));
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);
}
