"use client";

import { useState, useEffect, FormEvent } from "react";
import { BarChart3, Plus, X } from "lucide-react";
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
      const data = await res.json();
      setPolls(data);
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
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Oylamalar</h1>
            <p className="text-xs text-muted">Grup kararlarını demokratik al</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 transition text-sm font-medium flex items-center gap-2"
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
        <p className="text-muted text-center py-12">Yükleniyor...</p>
      ) : polls.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Henüz oylama yok</p>
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

            return (
              <div
                key={poll.id}
                className="bg-surface rounded-2xl border border-border p-5 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{poll.question}</h3>
                    <p className="text-xs text-muted mt-1">
                      {poll.createdByName} •{" "}
                      {new Date(poll.createdAt).toLocaleDateString("tr-TR")}
                      {poll.endsAt &&
                        ` • Bitiş: ${new Date(
                          poll.endsAt
                        ).toLocaleDateString("tr-TR")}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted">
                    {totalVotes} oy
                  </span>
                </div>

                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((option.voteCount / totalVotes) * 100)
                        : 0;
                    const isUserVote =
                      option.id === poll.userVotedOptionId;

                    return (
                      <button
                        key={option.id}
                        onClick={() => !hasVoted && vote(poll.id, option.id)}
                        disabled={hasVoted}
                        className={`w-full text-left relative overflow-hidden rounded-xl border transition ${
                          isUserVote
                            ? "border-primary bg-primary/5"
                            : hasVoted
                            ? "border-border bg-background"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        {/* Progress bar */}
                        {hasVoted && (
                          <div
                            className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between px-4 py-3">
                          <span className="text-sm font-medium">
                            {isUserVote && "✓ "}
                            {option.text}
                          </span>
                          {hasVoted && (
                            <span className="text-sm text-muted">
                              {percentage}% ({option.voteCount})
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
    <div className="bg-surface rounded-2xl border border-border p-5 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Yeni Oylama</h2>
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
        <div>
          <label className="block text-xs text-muted mb-1">Soru</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="Bu akşam ne oynayalım?"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Seçenekler</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder={`Seçenek ${i + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-muted hover:text-danger"
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
              className="text-xs text-primary hover:underline mt-2"
            >
              + Seçenek ekle
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
        >
          {submitting ? "Oluşturuluyor..." : "Oylama Başlat"}
        </button>
      </form>
    </div>
  );
}
