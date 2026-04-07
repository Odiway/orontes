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
  Gamepad2,
} from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

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
      const data = await res.json();
      setSessions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchParticipants(sessionId: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`);
      const data = await res.json();
      setParticipants(data);
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

  function openDetails(sessionId: string) {
    setSelectedSession(sessionId);
    fetchParticipants(sessionId);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-success" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Oyun Planları</h1>
            <p className="text-xs text-muted">
              Oyun seansları oluştur ve katıl
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 transition text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Plan
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <CreateSessionForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchSessions();
          }}
        />
      )}

      {/* Sessions list */}
      {loading ? (
        <p className="text-muted text-center py-12">Yükleniyor...</p>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Henüz oyun planı yok</p>
          <p className="text-sm mt-1">İlk planı sen oluştur!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-surface rounded-2xl border border-border p-5 animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-accent">{s.game}</p>
                    {s.description && (
                      <p className="text-sm text-muted mt-1">
                        {s.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span>
                        📅{" "}
                        {new Date(s.scheduledAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        👤 {s.createdByName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{" "}
                        {s.participantCount}
                        {s.maxPlayers ? `/${s.maxPlayers}` : ""} kişi
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
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
                    ? "Planlandı"
                    : s.status === "active"
                    ? "Aktif"
                    : s.status === "completed"
                    ? "Tamamlandı"
                    : "İptal"}
                </span>
              </div>

              {/* Response buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted mr-2">Katılıyor musun?</span>
                <button
                  onClick={() => respond(s.id, "yes")}
                  className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg px-3 py-1.5 text-sm transition"
                >
                  <Check className="w-4 h-4" /> Geliyorum
                </button>
                <button
                  onClick={() => respond(s.id, "maybe")}
                  className="flex items-center gap-1.5 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg px-3 py-1.5 text-sm transition"
                >
                  <HelpCircle className="w-4 h-4" /> Belki
                </button>
                <button
                  onClick={() => respond(s.id, "no")}
                  className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg px-3 py-1.5 text-sm transition"
                >
                  <XCircle className="w-4 h-4" /> Gelemem
                </button>
                <button
                  onClick={() => openDetails(s.id)}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  Katılımcılar
                </button>
              </div>

              {/* Participants detail */}
              {selectedSession === s.id && participants.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                      <span
                        key={p.id}
                        className={`text-xs px-2.5 py-1 rounded-lg ${
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
                          ? "✓"
                          : p.response === "maybe"
                          ? "?"
                          : "✗"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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
    <div className="bg-surface rounded-2xl border border-border p-5 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Yeni Oyun Planı</h2>
        <button onClick={onClose} className="text-muted hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Akşam CS2 maçı"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Oyun</label>
            <input
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="CS2, Valorant, LoL..."
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            Açıklama (opsiyonel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="Ranked oynayalım..."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">
              Tarih & Saat
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Maks. Oyuncu (opsiyonel)
            </label>
            <input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="5"
              min="2"
              max="100"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
        >
          {submitting ? "Oluşturuluyor..." : "Plan Oluştur"}
        </button>
      </form>
    </div>
  );
}
