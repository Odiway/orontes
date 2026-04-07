import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  gameSessions,
  sessionParticipants,
  users,
  notifications,
} from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { broadcastEvent } from "@/lib/sse";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db
      .select({
        id: gameSessions.id,
        title: gameSessions.title,
        game: gameSessions.game,
        description: gameSessions.description,
        scheduledAt: gameSessions.scheduledAt,
        status: gameSessions.status,
        maxPlayers: gameSessions.maxPlayers,
        createdAt: gameSessions.createdAt,
        createdByName: users.name,
        createdById: gameSessions.createdById,
        participantCount: sql<number>`(
          SELECT COUNT(*) FROM session_participants
          WHERE session_participants.session_id = ${gameSessions.id}
          AND session_participants.response = 'yes'
        )`,
      })
      .from(gameSessions)
      .innerJoin(users, eq(gameSessions.createdById, users.id))
      .orderBy(desc(gameSessions.scheduledAt));

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, game, description, scheduledAt, maxPlayers } =
      await req.json();

    if (!title || !game || !scheduledAt) {
      return NextResponse.json(
        { error: "Başlık, oyun ve tarih gerekli" },
        { status: 400 }
      );
    }

    const userId = session.user.id!;

    const [newSession] = await db
      .insert(gameSessions)
      .values({
        title,
        game,
        description,
        scheduledAt: new Date(scheduledAt),
        maxPlayers: maxPlayers || null,
        createdById: userId,
      })
      .returning();

    // Auto-join the creator
    await db.insert(sessionParticipants).values({
      sessionId: newSession.id,
      userId,
      response: "yes",
      respondedAt: new Date(),
    });

    // Create notifications for all users
    const allUsers = await db.select({ id: users.id }).from(users);
    const notifs = allUsers
      .filter((u) => u.id !== userId)
      .map((u) => ({
        userId: u.id,
        title: "🎮 Yeni Oyun Daveti!",
        body: `${session.user!.name} "${title}" için oyun planladı - ${game}`,
        type: "game_invite",
        linkTo: "/sessions",
      }));

    if (notifs.length > 0) {
      await db.insert(notifications).values(notifs);
    }

    broadcastEvent("new_session", {
      ...newSession,
      createdByName: session.user.name,
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
