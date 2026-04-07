import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, gameSessions, pollVotes, sessionParticipants } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { GAMES } from "@/lib/games";
import { User, MessageCircle, Calendar, Vote, Trophy, Gamepad2 } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const userId = session.user.id;

  const [msgCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(eq(messages.userId, userId));

  const [sessionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sessionParticipants)
    .where(eq(sessionParticipants.userId, userId));

  const [voteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pollVotes)
    .where(eq(pollVotes.userId, userId));

  const [createdSessions] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gameSessions)
    .where(eq(gameSessions.createdById, userId));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="glass rounded-3xl border border-border overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-primary via-neon-purple to-accent" />
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-3xl font-black text-white border-4 border-background shadow-xl">
            {session.user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-black">{session.user.name}</h1>
            <p className="text-sm text-muted flex items-center gap-2 mt-1">
              <User className="w-3.5 h-3.5" />
              {session.user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <ProfileStat
          icon={<MessageCircle className="w-4 h-4" />}
          value={msgCount.count}
          label="Mesaj"
          color="text-accent"
          bg="bg-accent/10"
        />
        <ProfileStat
          icon={<Calendar className="w-4 h-4" />}
          value={sessionCount.count}
          label="Katılım"
          color="text-success"
          bg="bg-success/10"
        />
        <ProfileStat
          icon={<Vote className="w-4 h-4" />}
          value={voteCount.count}
          label="Oy"
          color="text-warning"
          bg="bg-warning/10"
        />
        <ProfileStat
          icon={<Trophy className="w-4 h-4" />}
          value={createdSessions.count}
          label="Oluşturulan"
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>

      {/* All Games */}
      <div className="glass rounded-2xl border border-border p-6">
        <h2 className="font-bold flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Tüm Oyunlar
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className={`game-card rounded-xl border ${game.border} ${game.bg} p-3 text-center`}
            >
              <span className="text-2xl block mb-1">{game.emoji}</span>
              <p className={`text-xs font-bold ${game.text}`}>{game.shortName}</p>
              <p className="text-[10px] text-muted mt-0.5">{game.category}</p>
              <p className="text-[10px] text-muted/60 mt-1 leading-tight">{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileStat({
  icon,
  value,
  label,
  color,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="glass rounded-xl border border-border p-4 text-center">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${bg} ${color} mb-2`}>
        {icon}
      </div>
      <div className="text-xl font-black">{value}</div>
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
