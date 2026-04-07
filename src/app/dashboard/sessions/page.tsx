"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Calendar,
  Plus,
  X,
  Check,
  HelpCircle,
  XCircle,
  Users,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useSSE } from "@/hooks/useSSE";
import { GAMES } from "@/lib/games";

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

type Participant = {
  id: string;
  userId: string;
  response: string;
  userName: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useSSE({
    new_session: () => fetchSessions(),
    session_response: () => {
      fetchSessions();
      if (selectedSession) fetchParticipants(selectedSession);
    },
  });

  async function fetchSessions() {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchParticipants(sessionId: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch {
      // ignore
    }
  }

  async function respond(sessionId: string, response: string) {
    await fetch(`/api/sessions/${sessionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    fetchSessions();
    fetchParticipants(sessionId);
  }

  function toggleDetails(sessionId: string) {
    if (selectedSession === sessionId) {
      setSelectedSession(null);
    } else {
      setSelectedSession(sessionId);
      fetchParticipants(sessionId);
    }
  }

  function getGameData(gameName: string) {
    return GAMES.find(
      (g) =>
        g.name.toLowerCase() === gameName.toLowerCase() ||
        g.shortName.toLowerCase() === gameName.toLowerCase()
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center shadow-lg shadow-success/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Oyun Planları 🎮</h1>
            <p className="text-xs text-muted">
              Ekibini topla, sahaya in!
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 transition text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Plan
        </button>
      </div>

      {showForm && (
        <CreateSessionForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchSessions();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Yükleniyor...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <span className="text-6xl block mb-4">🎮</span>
          <p className="font-medium text-foreground">Henüz oyun planı yok</p>
          <p className="text-sm mt-1">İlk planı sen oluştur!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const game = getGameData(s.game);
            const isOpen = selectedSession === s.id;
            return (
              <div
                key={s.id}
                className={`glass rounded-2xl border overflow-hidden transition-all animate-fade-in ${
                  game ? game.border : "border-border"
                }`}
              >
                {/* Game color bar */}
                <div
                  className={`h-1 bg-gradient-to-r ${
                    game ? game.gradient : "from-primary to-accent"
                  }`}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          game ? game.bg : "bg-primary/10"
                        } flex items-center justify-center shrink-0 text-2xl`}
                      >
                        {game?.emoji || "🎮"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold">{s.title}</h3>
                        <p
                          className={`text-sm font-medium ${
                            game ? game.text : "text-accent"
                          }`}
                        >
                          {s.game}
                        </p>
                        {s.description && (
                          <p className="text-sm text-muted mt-1">
                            {s.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.scheduledAt).toLocaleDateString(
                              "tr-TR",
                              {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {s.participantCount}
                            {s.maxPlayers ? `/${s.maxPlayers}` : ""} kişi
                          </span>
                          <span>👤 {s.createdByName}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        s.status === "planned"
                          ? "bg-warning/10 text-warning"
                          : s.status === "active"
                          ? "bg-success/10 text-success"
                          : s.status === "completed"
                          ? "bg-muted/10 text-muted"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {s.status === "planned"
                        ? "📅 Planlandı"
                        : s.status === "active"
                        ? "🟢 Aktif"
                        : s.status === "completed"
                        ? "✅ Bitti"
                        : "❌ İptal"}
                    </span>
                  </div>

                  {/* Response buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted mr-1">
                      Katılıyor musun?
                    </span>
                    <button
                      onClick={() => respond(s.id, "yes")}
                      className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success rounded-xl px-3 py-2 text-xs font-medium transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Geliyorum
                    </button>
                    <button
                      onClick={() => respond(s.id, "maybe")}
                      className="flex items-center gap-1.5 bg-warning/10 hover:bg-warning/20 text-warning rounded-xl px-3 py-2 text-xs font-medium transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Belki
                    </button>
                    <button
                      onClick={() => respond(s.id, "no")}
                      className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl px-3 py-2 text-xs font-medium transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Gelemem
                    </button>
                    <button
                      onClick={() => toggleDetails(s.id)}
                      className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition"
                    >
                      Katılımcılar
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Participants */}
                  {isOpen && participants.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border animate-slide-down">
                      <div className="flex flex-wrap gap-2">
                        {participants.map((p) => (
                          <span
                            key={p.id}
                            className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                              p.response === "yes"
                                ? "bg-success/10 text-success"
                                : p.response === "maybe"
                                ? "bg-warning/10 text-warning"
                                : p.response === "no"
                                ? "bg-danger/10 text-danger"
                                : "bg-muted/10 text-muted"
                            }`}
                          >
                            {p.userName}{" "}
                            {p.response === "yes"
                              ? "✅"
                              : p.response === "maybe"
                              ? "🤔"
                              : "❌"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateSessionForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedGame = GAMES.find(
    (g) =>
      g.name.toLowerCase() === game.toLowerCase() ||
      g.shortName.toLowerCase() === game.toLowerCase()
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          game,
          description: description || null,
          scheduledAt,
          maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
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
    <div className="glass rounded-2xl border border-border p-6 mb-6 animate-scale-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold flex items-center gap-2">
          🎮 Yeni Oyun Planı
        </h2>
        <button onClick={onClose} className="text-muted hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">
            Oyun Seç
          </label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-2">
            {GAMES.slice(0, 12).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGame(g.shortName)}
                className={`rounded-xl p-2 text-center transition text-xs border ${
                  game === g.shortName || game === g.name
                    ? `${g.bg} ${g.border} ${g.text} font-bold`
                    : "border-border hover:border-primary/30 bg-surface"
                }`}
              >
                <span className="text-lg block">{g.emoji}</span>
                <span className="truncate block">{g.shortName}</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="Veya oyun adını yaz..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5 font-medium">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder={
                selectedGame
                  ? `${selectedGame.shortName} Ranked`
                  : "Akşam CS2 Ranked"
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5 font-medium">
              Tarih & Saat
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5 font-medium">
              Açıklama (opsiyonel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Detay ekle..."
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5 font-medium">
              Max Oyuncu
            </label>
            <input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder={selectedGame ? `${selectedGame.maxPlayers}` : "5"}
              min={2}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full font-semibold rounded-xl py-3 transition disabled:opacity-50 flex items-center justify-center gap-2 text-white ${
            selectedGame
              ? `bg-gradient-to-r ${selectedGame.gradient}`
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {selectedGame?.emoji || "🎮"} Plan Oluştur
            </>
          )}
        </button>
      </form>
    </div>
  );
}
