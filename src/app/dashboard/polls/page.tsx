"use client";

import { useState, useEffect, FormEvent } from "react";
import { BarChart3, Plus, X, Trophy, Vote } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

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

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  useSSE({
    new_poll: () => fetchPolls(),
    poll_vote: () => fetchPolls(),
  });

  async function fetchPolls() {
    try {
      const res = await fetch("/api/polls");
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function vote(pollId: string, optionId: string) {
    await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    fetchPolls();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Oylamalar 📊</h1>
            <p className="text-xs text-muted">
              Demokratik karar verme zamanı!
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 transition text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Oylama
        </button>
      </div>

      {showForm && (
        <CreatePollForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchPolls();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Yükleniyor...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <span className="text-6xl block mb-4">🗳️</span>
          <p className="font-medium text-foreground">Henüz oylama yok</p>
          <p className="text-sm mt-1">İlk oylamayı sen başlat!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, o) => sum + o.voteCount,
              0
            );
            const hasVoted = !!poll.userVotedOptionId;
            const winningOption = hasVoted
              ? poll.options.reduce((a, b) =>
                  a.voteCount > b.voteCount ? a : b
                )
              : null;

            return (
              <div
                key={poll.id}
                className="glass rounded-2xl border border-border overflow-hidden animate-fade-in"
              >
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {poll.question}
                        {!poll.isActive && (
                          <span className="text-xs bg-muted/10 text-muted px-2 py-0.5 rounded-full">
                            Kapandı
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted mt-1 flex items-center gap-2">
                        <span>👤 {poll.createdByName}</span>
                        <span>•</span>
                        <span>
                          {new Date(poll.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        {poll.endsAt && (
                          <>
                            <span>•</span>
                            <span>
                              Bitiş:{" "}
                              {new Date(poll.endsAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted bg-surface rounded-full px-3 py-1">
                      <Vote className="w-3 h-3" />
                      {totalVotes} oy
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="px-5 pb-5 space-y-2">
                  {poll.options.map((option) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((option.voteCount / totalVotes) * 100)
                        : 0;
                    const isUserVote = option.id === poll.userVotedOptionId;
                    const isWinner =
                      hasVoted && winningOption?.id === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          !hasVoted && poll.isActive && vote(poll.id, option.id)
                        }
                        disabled={hasVoted || !poll.isActive}
                        className={`w-full text-left relative overflow-hidden rounded-xl border transition-all ${
                          isUserVote
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : isWinner
                            ? "border-warning/50 bg-warning/5"
                            : hasVoted
                            ? "border-border bg-background"
                            : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                        }`}
                      >
                        {/* Progress bar */}
                        {hasVoted && (
                          <div
                            className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                              isUserVote
                                ? "bg-primary/15"
                                : isWinner
                                ? "bg-warning/10"
                                : "bg-foreground/5"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between px-4 py-3">
                          <span className="text-sm font-medium flex items-center gap-2">
                            {isUserVote && (
                              <span className="text-primary">✓</span>
                            )}
                            {isWinner && !isUserVote && (
                              <Trophy className="w-3.5 h-3.5 text-warning" />
                            )}
                            {option.text}
                          </span>
                          {hasVoted && (
                            <span
                              className={`text-sm font-bold ${
                                isUserVote
                                  ? "text-primary"
                                  : isWinner
                                  ? "text-warning"
                                  : "text-muted"
                              }`}
                            >
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreatePollForm({
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

  function addOption() {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  }

  function updateOption(index: number, value: string) {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setError("En az 2 seçenek gerekli");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: validOptions }),
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
        <h2 className="font-bold flex items-center gap-2">🗳️ Yeni Oylama</h2>
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
            Soru
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            placeholder="Bu akşam ne oynayalım? 🎮"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">
            Seçenekler
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-10 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-muted">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder={
                    i === 0 ? "CS2 Ranked" : i === 1 ? "LoL ARAM" : `Seçenek ${i + 1}`
                  }
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-muted hover:text-danger transition p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" /> Seçenek Ekle
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl py-3 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>📊 Oylamayı Başlat</>
          )}
        </button>
      </form>
    </div>
  );
}
