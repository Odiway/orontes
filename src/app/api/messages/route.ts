import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { broadcastEvent } from "@/lib/sse";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        userId: messages.userId,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return NextResponse.json(allMessages.reverse());
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

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 });
    }

    const userId = session.user.id!;

    const [msg] = await db
      .insert(messages)
      .values({
        content: content.trim(),
        userId,
      })
      .returning();

    const enriched = {
      ...msg,
      userName: session.user.name,
      userAvatar: session.user.image,
    };

    broadcastEvent("new_message", enriched);

    return NextResponse.json(enriched, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
