"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Real-time messages via SSE
  useSSE({
    new_message: (_event, data) => {
      const msg = data as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
  });

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      setInput("");
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Grup Sohbeti</h1>
          <p className="text-xs text-muted">Herkese açık sohbet kanalı</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-border p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted">
            Mesajlar yükleniyor...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
            <p>Henüz mesaj yok. İlk mesajı sen yaz!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                {msg.userName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{msg.userName}</span>
                  <span className="text-xs text-muted">
                    {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm mt-0.5 break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesajını yaz..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition text-sm"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-3 transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
