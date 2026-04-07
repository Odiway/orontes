import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gameSessions, messages, polls, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import {
  MessageCircle,
  Calendar,
  BarChart3,
  Users,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <h1 className="text-2xl font-bold mb-1">
          Hoş geldin, {session.user.name}! 👋
        </h1>
        <p className="text-muted">
          Bugün ne oynuyoruz?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Üye"
          value={userCount.count}
          color="text-accent"
        />
        <StatCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Mesaj"
          value={messageCount.count}
          color="text-primary"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Planlanan Oyun"
          value={upcomingSessions.length}
          color="text-success"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Aktif Oylama"
          value={activePolls.length}
          color="text-warning"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Games */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Yaklaşan Oyunlar
            </h2>
            <Link
              href="/dashboard/sessions"
              className="text-xs text-primary hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">
              Henüz planlanmış oyun yok
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted">{s.game}</p>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(s.scheduledAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chat */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              Son Mesajlar
            </h2>
            <Link
              href="/dashboard/chat"
              className="text-xs text-primary hover:underline"
            >
              Sohbete git
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">
              Henüz mesaj yok
            </p>
          ) : (
            <div className="space-y-3">
              {recentMessages.reverse().map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                    {m.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{m.userName}</p>
                    <p className="text-sm truncate">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Polls */}
        {activePolls.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-warning" />
                Aktif Oylamalar
              </h2>
              <Link
                href="/dashboard/polls"
                className="text-xs text-primary hover:underline"
              >
                Tümünü gör
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {activePolls.map((p) => (
                <Link
                  key={p.id}
                  href="/dashboard/polls"
                  className="p-3 bg-background rounded-xl border border-border hover:border-primary/50 transition"
                >
                  <p className="text-sm font-medium">{p.question}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
