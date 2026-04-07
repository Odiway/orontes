"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, MessageCircle, Smile } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
};

const QUICK_EMOJIS = ["🔥", "😂", "GG", "👍", "💀", "🎮", "⚔️", "🏆", "👀", "❤️"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useSSE({
    new_message: (_event, data) => {
      const msg = data as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
  });

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
      inputRef.current?.focus();
    }
  }

  function addEmoji(emoji: string) {
    setInput((prev) => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Grup Sohbeti 💬</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-xs text-muted">Canlı - Gerçek zamanlı</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl border border-border p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted">Mesajlar yükleniyor...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <MessageCircle className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-medium">Henüz mesaj yok</p>
            <p className="text-sm mt-1">İlk mesajı yaz, sohbeti başlat! 🚀</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const showAvatar =
              i === 0 || messages[i - 1].userId !== msg.userId;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${
                  !showAvatar ? "pl-11" : ""
                }`}
              >
                {showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {msg.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-bold text-primary">
                        {msg.userName}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  <p className="text-sm break-words leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick emojis */}
      {showEmojis && (
        <div className="flex items-center gap-1 mt-2 px-2 animate-scale-in">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-surface"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`p-3 rounded-xl transition ${
            showEmojis
              ? "bg-primary/10 text-primary"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <Smile className="w-5 h-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesajını yaz..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition text-sm"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-3 transition disabled:opacity-30 flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
