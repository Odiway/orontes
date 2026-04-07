import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { polls, pollOptions, pollVotes, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { broadcastEvent } from "@/lib/sse";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPolls = await db
      .select({
        id: polls.id,
        question: polls.question,
        createdById: polls.createdById,
        createdByName: users.name,
        endsAt: polls.endsAt,
        isActive: polls.isActive,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .innerJoin(users, eq(polls.createdById, users.id))
      .orderBy(desc(polls.createdAt));

    // Get options with vote counts for each poll
    const pollsWithOptions = await Promise.all(
      allPolls.map(async (poll) => {
        const options = await db
          .select({
            id: pollOptions.id,
            text: pollOptions.text,
            voteCount: sql<number>`(
              SELECT COUNT(*) FROM poll_votes
              WHERE poll_votes.option_id = ${pollOptions.id}
            )`,
          })
          .from(pollOptions)
          .where(eq(pollOptions.pollId, poll.id));

        // Check if current user voted
        const userVotes = await db
          .select({ optionId: pollVotes.optionId })
          .from(pollVotes)
          .innerJoin(pollOptions, eq(pollVotes.optionId, pollOptions.id))
          .where(eq(pollOptions.pollId, poll.id));

        const userVotedOptionId = userVotes.find(
          (v) => v.optionId
        )?.optionId;

        return { ...poll, options, userVotedOptionId };
      })
    );

    return NextResponse.json(pollsWithOptions);
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

    const { question, options, endsAt } = await req.json();

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: "Soru ve en az 2 seçenek gerekli" },
        { status: 400 }
      );
    }

    const userId = session.user.id!;

    const [poll] = await db
      .insert(polls)
      .values({
        question,
        createdById: userId,
        endsAt: endsAt ? new Date(endsAt) : null,
      })
      .returning();

    await db.insert(pollOptions).values(
      options.map((opt: string) => ({
        pollId: poll.id,
        text: opt,
      }))
    );

    broadcastEvent("new_poll", {
      ...poll,
      createdByName: session.user.name,
    });

    return NextResponse.json(poll, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
