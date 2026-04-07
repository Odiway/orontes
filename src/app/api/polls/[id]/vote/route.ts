import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { pollVotes, pollOptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { broadcastEvent } from "@/lib/sse";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pollId } = await params;
    const { optionId } = await req.json();

    const userId = session.user.id;

    // Check if user already voted on this poll
    const existingVotes = await db
      .select({ id: pollVotes.id })
      .from(pollVotes)
      .innerJoin(pollOptions, eq(pollVotes.optionId, pollOptions.id))
      .where(
        and(
          eq(pollOptions.pollId, pollId),
          eq(pollVotes.userId, userId)
        )
      );

    if (existingVotes.length > 0) {
      return NextResponse.json(
        { error: "Zaten oy kullandınız" },
        { status: 400 }
      );
    }

    await db.insert(pollVotes).values({
      optionId,
      userId,
    });

    broadcastEvent("poll_vote", {
      pollId,
      optionId,
      userName: session.user.name,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
