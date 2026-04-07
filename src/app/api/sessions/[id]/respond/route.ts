import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessionParticipants, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { broadcastEvent } from "@/lib/sse";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const participants = await db
      .select({
        id: sessionParticipants.id,
        userId: sessionParticipants.userId,
        response: sessionParticipants.response,
        respondedAt: sessionParticipants.respondedAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(sessionParticipants)
      .innerJoin(users, eq(sessionParticipants.userId, users.id))
      .where(eq(sessionParticipants.sessionId, id));

    return NextResponse.json(participants);
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { response } = await req.json();

    if (!["yes", "no", "maybe"].includes(response)) {
      return NextResponse.json({ error: "Geçersiz cevap" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if already responded
    const [existing] = await db
      .select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, id),
          eq(sessionParticipants.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(sessionParticipants)
        .set({ response, respondedAt: new Date() })
        .where(eq(sessionParticipants.id, existing.id));
    } else {
      await db.insert(sessionParticipants).values({
        sessionId: id,
        userId,
        response,
        respondedAt: new Date(),
      });
    }

    broadcastEvent("session_response", {
      sessionId: id,
      userId: session.user.id,
      userName: session.user.name,
      response,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
