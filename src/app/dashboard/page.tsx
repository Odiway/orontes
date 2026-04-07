import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { gameSessions, messages, polls, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { GAMES } from "@/lib/games";
import {
  MessageCircle,
  Calendar,
  BarChart3,
  Users,
  Gamepad2,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [messageCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages);

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const upcomingSessions = await db
    .select({
      id: gameSessions.id,
      title: gameSessions.title,
      game: gameSessions.game,
      scheduledAt: gameSessions.scheduledAt,
      status: gameSessions.status,
    })
    .from(gameSessions)
    .where(eq(gameSessions.status, "planned"))
    .orderBy(gameSessions.scheduledAt)
    .limit(3);

  const activePolls = await db
    .select({
      id: polls.id,
      question: polls.question,
      createdAt: polls.createdAt,
    })
    .from(polls)
    .where(eq(polls.isActive, true))
    .orderBy(desc(polls.createdAt))
    .limit(3);

  const recentMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      userName: users.name,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .orderBy(desc(messages.createdAt))
    .limit(5);

  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? "Gece kuşu"
      : hour < 12
      ? "Günaydın"
      : hour < 18
      ? "İyi günler"
      : "İyi akşamlar";

  const featuredGames = GAMES.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-accent/10 border border-primary/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
            <Zap className="w-4 h-4" />
            {greeting}
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">
            {session.user.name}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted text-sm md:text-base">
            Bugün ne oynuyoruz? Ekibini topla ve sahaya in!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Üyeler"
          value={userCount.count}
          color="text-accent"
          bg="bg-accent/10"
        />
        <StatCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Mesajlar"
          value={messageCount.count}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Yaklaşan Oyun"
          value={upcomingSessions.length}
          color="text-success"
          bg="bg-success/10"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Aktif Oylama"
          value={activePolls.length}
          color="text-warning"
          bg="bg-warning/10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/dashboard/chat"
          className="game-card glass rounded-2xl border border-border p-4 text-center group"
        >
          <span className="text-2xl mb-2 block">💬</span>
          <span className="text-xs font-medium text-muted group-hover:text-foreground transition">
            Sohbete Git
          </span>
        </Link>
        <Link
          href="/dashboard/sessions"
          className="game-card glass rounded-2xl border border-border p-4 text-center group"
        >
          <span className="text-2xl mb-2 block">🎮</span>
          <span className="text-xs font-medium text-muted group-hover:text-foreground transition">
            Oyun Planla
          </span>
        </Link>
        <Link
          href="/dashboard/polls"
          className="game-card glass rounded-2xl border border-border p-4 text-center group"
        >
          <span className="text-2xl mb-2 block">📊</span>
          <span className="text-xs font-medium text-muted group-hover:text-foreground transition">
            Oylama Başlat
          </span>
        </Link>
      </div>

      {/* Games Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Popüler Oyunlar
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 stagger-children">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className={`game-card rounded-2xl border ${game.border} ${game.bg} p-3 text-center cursor-default`}
            >
              <span className="text-2xl block mb-1">{game.emoji}</span>
              <p className={`text-xs font-bold ${game.text}`}>
                {game.shortName}
              </p>
              <p className="text-[10px] text-muted">{game.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-success" />
              Yaklaşan Oyunlar
            </h2>
            <Link
              href="/dashboard/sessions"
              className="text-xs text-primary hover:text-primary-hover transition flex items-center gap-1"
            >
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-muted/20 mx-auto mb-2" />
              <p className="text-xs text-muted">Henüz plan yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => {
                const game = GAMES.find(
                  (g) =>
                    g.name.toLowerCase() === s.game.toLowerCase() ||
                    g.shortName.toLowerCase() === s.game.toLowerCase()
                );
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      game ? game.bg : "bg-surface"
                    } border ${game ? game.border : "border-border"}`}
                  >
                    <span className="text-xl">{game?.emoji || "🎮"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {s.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Clock className="w-3 h-3" />
                        {new Date(s.scheduledAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        game ? `${game.bg} ${game.text}` : "bg-primary/10 text-primary"
                      }`}
                    >
                      {s.game}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Chat */}
        <div className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-accent" />
              Son Mesajlar
            </h2>
            <Link
              href="/dashboard/chat"
              className="text-xs text-primary hover:text-primary-hover transition flex items-center gap-1"
            >
              Sohbet <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="text-center py-6">
              <MessageCircle className="w-8 h-8 text-muted/20 mx-auto mb-2" />
              <p className="text-xs text-muted">Henüz mesaj yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.reverse().map((msg) => (
                <div key={msg.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {msg.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold">
                        {msg.userName}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-warning" />
              Aktif Oylamalar
            </h2>
            <Link
              href="/dashboard/polls"
              className="text-xs text-primary hover:text-primary-hover transition flex items-center gap-1"
            >
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {activePolls.map((poll) => (
              <Link
                key={poll.id}
                href="/dashboard/polls"
                className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20 hover:border-warning/40 transition"
              >
                <span className="text-lg">🗳️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {poll.question}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(poll.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-warning" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`glass rounded-2xl border border-border p-4`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bg} ${color} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
