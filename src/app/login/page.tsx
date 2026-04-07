"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Gamepad2, LogIn, Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş başarısız");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 animate-pulse-glow">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </Link>
          <h1 className="text-3xl font-black gradient-text">Orontes</h1>
          <p className="text-muted mt-2 text-sm">Gaming Squad Hub</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-border">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <LogIn className="w-5 h-5 text-primary" />
            Giriş Yap
          </h2>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-3 text-sm mb-4 animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition text-sm"
                placeholder="gamer@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl py-3 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Hesabın yok mu?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary-hover font-medium transition"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8 text-2xl opacity-40">
          🔫 ⚔️ 🎯 ⚽ 🐉 🗡️ ⛏️
        </div>
      </div>
    </div>
  );
}
