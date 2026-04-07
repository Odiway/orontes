"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useSSE } from "@/hooks/useSSE";
import { GAMES } from "@/lib/games";
import {
  Send,
  Smile,
  Hash,
  Gamepad2,
  BarChart3,
  Calendar,
  Users,
  Bell,
  LogOut,
  Plus,
  X,
  Check,
  HelpCircle,
  XCircle,
  ChevronDown,
  Menu,
  Crown,
  Clock,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
};

type GameSession = {
  id: string;
  title: string;
  game: string;
  description: string | null;
  scheduledAt: string;
  status: string;
  maxPlayers: number | null;
  createdAt: string;
  createdByName: string;
  createdById: string;
  participantCount: number;
};

type PollOption = {
  id: string;
  text: string;
  voteCount: number;
};

type Poll = {
  id: string;
  question: string;
  createdById: string;
  createdByName: string;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  options: PollOption[];
  userVotedOptionId: string | null;
};

type Member = {
  id: string;
  name: string;
  isOnline: boolean | null;
};

type Notif = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const QUICK_EMOJIS = [
  "🔥", "😂", "👍", "💀", "🎮", "⚔️", "🏆", "👀",
  "❤️", "😎", "🫡", "💯", "GG", "🤣", "👏",
];

const USER_COLORS = [
  "#f97316", "#06b6d4", "#a855f7", "#22c55e",
  "#eab308", "#ec4899", "#6366f1", "#14b8a6",
  "#f43f5e", "#8b5cf6", "#0ea5e9", "#84cc16",
];

function userColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return USER_COLORS[Math.abs(h) % USER_COLORS.length];
}

function fmtTime(d: string): string {
  const date = new Date(d);
  const now = new Date();
  const t = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Bugün ${t}`;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return `Dün ${t}`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + ` ${t}`;
}

function fmtDateShort(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

type Props = {
  user: { id: string; name: string; email: string; image?: string | null };
  members: Member[];
};

export function DiscordApp({ user, members }: Props) {
  // ─── State ───
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeForm, setActiveForm] = useState<"session" | "poll" | null>(null);
  const [showRight, setShowRight] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Initial data fetch ───
  useEffect(() => {
    Promise.all([
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/polls").then((r) => r.json()),
    ])
      .then(([msgs, sess, plls]) => {
        setMessages(Array.isArray(msgs) ? msgs : []);
        setSessions(Array.isArray(sess) ? sess : []);
        setPolls(Array.isArray(plls) ? plls : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ─── Real-time SSE ───
  useSSE({
    new_message: (_, data) => {
      const msg = data as Message;
      setMessages((p) => (p.some((m) => m.id === msg.id) ? p : [...p, msg]));
    },
    new_session: () => refreshSessions(),
    session_response: () => refreshSessions(),
    new_poll: () => refreshPolls(),
    poll_vote: () => refreshPolls(),
  });

  // ─── Auto-scroll ───
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Notification polling ───
  useEffect(() => {
    fetchNotifs();
    const i = setInterval(fetchNotifs, 15000);
    return () => clearInterval(i);
  }, []);

  // ─── API helpers ───
  async function fetchNotifs() {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) setNotifs(await r.json());
    } catch {}
  }
  async function refreshSessions() {
    try {
      const r = await fetch("/api/sessions");
      if (r.ok) setSessions(await r.json());
    } catch {}
  }
  async function refreshPolls() {
    try {
      const r = await fetch("/api/polls");
      if (r.ok) setPolls(await r.json());
    } catch {}
  }

  async function sendMessage(e: FormEvent) {
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
    } catch {} finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function respondSession(id: string, response: string) {
    await fetch(`/api/sessions/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    refreshSessions();
  }

  async function votePoll(pollId: string, optionId: string) {
    await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    refreshPolls();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  const unread = notifs.filter((n) => !n.isRead).length;
  const planned = sessions.filter((s) => s.status === "planned");
  const activePolls = polls.filter((p) => p.isActive);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ════════ LEFT SIDEBAR ════════ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] dc-sidebar flex flex-col transition-transform duration-200 ${
          showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Server header */}
        <div className="h-12 px-4 flex items-center gap-2.5 dc-header-shadow shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] gradient-text select-none">
            Orontes Gaming
          </span>
          <button
            onClick={() => setShowSidebar(false)}
            className="ml-auto lg:hidden text-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channels + Games */}
        <div className="flex-1 overflow-y-auto pt-4 px-2 space-y-5 dc-scrollbar">
          {/* Channel */}
          <div>
            <p className="dc-section-title">
              <ChevronDown className="w-2.5 h-2.5" /> Metin kanalları
            </p>
            <div className="dc-channel-active">
              <Hash className="w-[18px] h-[18px] text-white/50" />
              <span>genel</span>
            </div>
          </div>

          {/* Games */}
          <div>
            <p className="dc-section-title">
              <ChevronDown className="w-2.5 h-2.5" /> Oyunlar — {GAMES.length}
            </p>
            <div className="space-y-px">
              {GAMES.map((g) => (
                <div key={g.id} className="dc-channel-item group">
                  <span className="text-base leading-none">{g.emoji}</span>
                  <span className="truncate text-[13px]">{g.shortName}</span>
                  <span className="ml-auto text-[9px] text-muted/30 hidden group-hover:inline">
                    {g.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User panel */}
        <div className="dc-user-panel">
          <div className="flex items-center gap-2 px-1">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-success border-[2.5px] border-[#0c0c1a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-success/70">Çevrimiçi</p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="p-1.5 rounded hover:bg-white/10 text-muted hover:text-danger transition"
              title="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ════════ MAIN AREA ════════ */}
      <div className="flex-1 flex flex-col min-w-0 dc-main">
        {/* Header */}
        <div className="h-12 px-4 flex items-center gap-2 dc-header-shadow shrink-0">
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-1 text-muted hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Hash className="w-5 h-5 text-muted/40" />
          <span className="font-semibold text-[15px]">genel</span>
          <div className="w-px h-5 bg-white/10 mx-1.5 hidden sm:block" />
          <span className="text-[13px] text-muted/50 hidden sm:block truncate">
            Sohbet et · Oyun planla · Oylama yap
          </span>
          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="dc-icon-btn relative"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifs(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto dc-popup z-50 animate-scale-in">
                  <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Bildirimler
                    </span>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-muted hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {notifs.length === 0 ? (
                    <div className="p-8 text-center text-muted/50 text-xs">
                      Bildirim yok
                    </div>
                  ) : (
                    notifs.slice(0, 15).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`px-3 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.03] cursor-pointer transition ${
                          !n.isRead ? "border-l-2 border-l-primary bg-primary/[0.04]" : ""
                        }`}
                      >
                        <p className="text-[11px] font-semibold leading-tight">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-muted/60 mt-0.5 leading-relaxed">
                          {n.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Toggle right panel */}
          <button
            onClick={() => setShowRight(!showRight)}
            className={`dc-icon-btn hidden md:block ${
              showRight ? "bg-white/10 text-white" : ""
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* ──── Chat column ──── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto dc-scrollbar">
              {/* Welcome header */}
              <div className="px-4 pt-12 pb-4 mb-2">
                <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-primary via-accent to-neon-purple flex items-center justify-center mb-4 shadow-2xl shadow-primary/25">
                  <Hash className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-[28px] font-black mb-1 leading-tight">
                  #genel kanalına hoş geldin!
                </h3>
                <p className="text-muted/60 text-[15px]">
                  Burada sohbet edebilir, oyun planlayabilir ve oylama
                  başlatabilirsin.
                </p>
              </div>
              <div className="h-px bg-white/[0.04] mx-4 mb-2" />

              {/* Loading state */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted/40">
                  <span className="text-4xl block mb-3">💬</span>
                  <p className="text-sm">Henüz mesaj yok. İlk mesajı sen at!</p>
                </div>
              ) : (
                <div className="px-4">
                  {messages.map((msg, i) => {
                    const prev = i > 0 ? messages[i - 1] : null;
                    const showHeader =
                      !prev ||
                      prev.userId !== msg.userId ||
                      new Date(msg.createdAt).getTime() -
                        new Date(prev.createdAt).getTime() >
                        420000;
                    return (
                      <div
                        key={msg.id}
                        className={`group flex gap-4 hover:bg-white/[0.015] -mx-4 px-4 rounded ${
                          showHeader ? "mt-[17px] pt-0.5" : ""
                        } py-px`}
                      >
                        {showHeader ? (
                          <div
                            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5"
                            style={{
                              background: `linear-gradient(135deg, ${userColor(msg.userId)}, ${userColor(msg.userId)}88)`,
                            }}
                          >
                            {msg.userName.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-10 shrink-0 flex items-center justify-center">
                            <span className="dc-msg-time">
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "tr-TR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          {showHeader && (
                            <div className="flex items-baseline gap-2">
                              <span
                                className="font-semibold text-[15px] hover:underline cursor-pointer"
                                style={{ color: userColor(msg.userId) }}
                              >
                                {msg.userName}
                              </span>
                              <span className="text-[11px] text-muted/40">
                                {fmtTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <p className="text-[15px] leading-[1.375rem] break-words text-foreground/85">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} className="h-6" />
                </div>
              )}
            </div>

            {/* Inline forms */}
            {activeForm === "session" && (
              <SessionForm
                onClose={() => setActiveForm(null)}
                onCreated={() => {
                  setActiveForm(null);
                  refreshSessions();
                }}
              />
            )}
            {activeForm === "poll" && (
              <PollForm
                onClose={() => setActiveForm(null)}
                onCreated={() => {
                  setActiveForm(null);
                  refreshPolls();
                }}
              />
            )}

            {/* Emoji bar */}
            {showEmojis && (
              <div className="px-4 py-2 flex gap-1 flex-wrap animate-fade-in">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setInput((p) => p + em);
                      setShowEmojis(false);
                      inputRef.current?.focus();
                    }}
                    className="text-xl hover:scale-125 transition-transform p-1 rounded hover:bg-white/10"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="px-4 pb-6 pt-0 shrink-0">
              <form onSubmit={sendMessage} className="dc-input-bar">
                <button
                  type="button"
                  onClick={() =>
                    setActiveForm(activeForm === "session" ? null : "session")
                  }
                  className={`dc-input-action rounded-l-lg ${
                    activeForm === "session" ? "!text-primary bg-primary/10" : ""
                  }`}
                  title="Oyun Planla"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveForm(activeForm === "poll" ? null : "poll")
                  }
                  className={`dc-input-action ${
                    activeForm === "poll" ? "!text-warning bg-warning/10" : ""
                  }`}
                  title="Oylama Başlat"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/[0.06]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="#genel kanalına mesaj gönder"
                  className="flex-1 bg-transparent px-3 py-[11px] text-[15px] placeholder:text-muted/35 focus:outline-none min-w-0"
                  maxLength={1000}
                />
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`dc-input-action ${
                    showEmojis ? "!text-warning" : ""
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                {input.trim() && (
                  <button
                    type="submit"
                    disabled={sending}
                    className="dc-input-action !text-primary hover:!text-primary-hover rounded-r-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* ──── RIGHT PANEL ──── */}
          {showRight && (
            <aside className="hidden md:flex w-[240px] dc-sidebar flex-col border-l border-white/[0.04] overflow-y-auto dc-scrollbar shrink-0">
              {/* Members */}
              <div className="p-3 pt-4">
                <p className="dc-section-title px-1 mb-2">
                  Üyeler — {members.length}
                </p>
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 px-1 py-1.5 rounded hover:bg-white/[0.03] cursor-default group"
                  >
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          background:
                            m.id === user.id
                              ? "linear-gradient(135deg, #6366f1, #bf5af2)"
                              : `linear-gradient(135deg, ${userColor(m.id)}, ${userColor(m.id)}88)`,
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-[13px] text-muted/70 group-hover:text-foreground transition truncate">
                      {m.name}
                    </span>
                    {m.id === user.id && (
                      <Crown className="w-3 h-3 text-gold ml-auto shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Upcoming Sessions */}
              <div className="p-3 border-t border-white/[0.04]">
                <p className="dc-section-title px-1 mb-2">
                  🎮 Yaklaşan{planned.length > 0 ? ` — ${planned.length}` : ""}
                </p>
                {planned.length === 0 ? (
                  <p className="text-[11px] text-muted/35 px-1">
                    Henüz plan yok
                  </p>
                ) : (
                  planned.slice(0, 5).map((s) => {
                    const game = GAMES.find(
                      (g) =>
                        g.shortName.toLowerCase() === s.game.toLowerCase() ||
                        g.name.toLowerCase() === s.game.toLowerCase()
                    );
                    return (
                      <div
                        key={s.id}
                        className="mb-2 rounded-lg overflow-hidden border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition"
                      >
                        <div
                          className={`h-0.5 bg-gradient-to-r ${
                            game?.gradient || "from-primary to-accent"
                          }`}
                        />
                        <div className="p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm leading-none">
                              {game?.emoji || "🎮"}
                            </span>
                            <span className="text-[12px] font-bold truncate">
                              {s.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted/50 mb-1.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{fmtDateShort(s.scheduledAt)}</span>
                            <span>·</span>
                            <span>
                              {s.participantCount}
                              {s.maxPlayers ? `/${s.maxPlayers}` : ""} kişi
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => respondSession(s.id, "yes")}
                              className="dc-mini-btn text-success bg-success/10 hover:bg-success/20"
                            >
                              <Check className="w-2.5 h-2.5" /> Gel
                            </button>
                            <button
                              onClick={() => respondSession(s.id, "maybe")}
                              className="dc-mini-btn text-warning bg-warning/10 hover:bg-warning/20"
                            >
                              <HelpCircle className="w-2.5 h-2.5" /> Belki
                            </button>
                            <button
                              onClick={() => respondSession(s.id, "no")}
                              className="dc-mini-btn text-danger bg-danger/10 hover:bg-danger/20"
                            >
                              <XCircle className="w-2.5 h-2.5" /> Yok
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Active Polls */}
              <div className="p-3 border-t border-white/[0.04]">
                <p className="dc-section-title px-1 mb-2">
                  📊 Oylamalar
                  {activePolls.length > 0 ? ` — ${activePolls.length}` : ""}
                </p>
                {activePolls.length === 0 ? (
                  <p className="text-[11px] text-muted/35 px-1">
                    Aktif oylama yok
                  </p>
                ) : (
                  activePolls.slice(0, 3).map((poll) => {
                    const total = poll.options.reduce(
                      (s, o) => s + o.voteCount,
                      0
                    );
                    const voted = !!poll.userVotedOptionId;
                    return (
                      <div
                        key={poll.id}
                        className="mb-2 rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5"
                      >
                        <p className="text-[11px] font-bold mb-1.5 leading-tight">
                          {poll.question}
                        </p>
                        <div className="space-y-1">
                          {poll.options.map((opt) => {
                            const pct =
                              total > 0
                                ? Math.round((opt.voteCount / total) * 100)
                                : 0;
                            const isVoted = opt.id === poll.userVotedOptionId;
                            return (
                              <button
                                key={opt.id}
                                onClick={() =>
                                  !voted && votePoll(poll.id, opt.id)
                                }
                                disabled={voted}
                                className={`w-full relative overflow-hidden rounded text-left border transition ${
                                  isVoted
                                    ? "border-primary/40"
                                    : "border-white/[0.04] hover:border-primary/25"
                                }`}
                              >
                                {voted && (
                                  <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                      isVoted ? "bg-primary/20" : "bg-white/[0.04]"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                <div className="relative flex justify-between px-2 py-1 text-[10px]">
                                  <span className="font-medium">
                                    {isVoted && "✓ "}
                                    {opt.text}
                                  </span>
                                  {voted && (
                                    <span
                                      className={`font-bold ${
                                        isVoted ? "text-primary" : "text-muted/50"
                                      }`}
                                    >
                                      {pct}%
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[9px] text-muted/35 mt-1.5">
                          {total} oy · {poll.createdByName}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SESSION CREATION FORM
   ═══════════════════════════════════════════ */

function SessionForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sel = GAMES.find((g) => g.shortName === game || g.name === game);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title || !game || !scheduledAt) {
      setError("Tüm alanları doldur");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          game,
          scheduledAt,
          maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Hata oluştu");
        return;
      }
      onCreated();
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-4 mb-2 dc-form-panel animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Oyun Planı Oluştur
        </h3>
        <button onClick={onClose} className="text-muted hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-danger mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Game selector */}
        <div className="flex gap-1.5 flex-wrap">
          {GAMES.slice(0, 12).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGame(g.shortName)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                game === g.shortName
                  ? `${g.bg} ${g.border} ${g.text}`
                  : "border-white/[0.06] text-muted/60 hover:border-white/15 hover:text-muted"
              }`}
            >
              {g.emoji} {g.shortName}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Plan başlığı"
            className="dc-form-input flex-1"
            required
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="dc-form-input w-[180px]"
            required
          />
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            placeholder="Max"
            className="dc-form-input w-16"
            min="1"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50 ${
            sel
              ? `bg-gradient-to-r ${sel.gradient} hover:opacity-90`
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {submitting
            ? "Oluşturuluyor..."
            : `🎮 ${sel ? sel.shortName + " Planı" : "Plan"} Oluştur`}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════
   POLL CREATION FORM
   ═══════════════════════════════════════════ */

function PollForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = options.filter((o) => o.trim());
    if (!question || valid.length < 2) {
      setError("Soru ve en az 2 seçenek gerekli");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: valid }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Hata oluştu");
        return;
      }
      onCreated();
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-4 mb-2 dc-form-panel animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-warning" />
          Oylama Başlat
        </h3>
        <button onClick={onClose} className="text-muted hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-danger mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Soru: Bu akşam ne oynayalım?"
          className="dc-form-input w-full"
          required
        />
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[10px] text-muted/40 w-4 text-right font-mono">
                {i + 1}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const n = [...options];
                  n[i] = e.target.value;
                  setOptions(n);
                }}
                placeholder={
                  i === 0 ? "CS2" : i === 1 ? "LoL" : `Seçenek ${i + 1}`
                }
                className="dc-form-input flex-1"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  className="text-muted hover:text-danger"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {options.length < 8 && (
            <button
              type="button"
              onClick={() => setOptions([...options, ""])}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1 ml-6"
            >
              <Plus className="w-3 h-3" /> Seçenek ekle
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-warning to-orange-500 hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Oluşturuluyor..." : "📊 Oylamayı Başlat"}
        </button>
      </form>
    </div>
  );
}
