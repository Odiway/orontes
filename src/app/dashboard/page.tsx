import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DiscordApp } from "@/components/discord-app";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const members = await db
    .select({ id: users.id, name: users.name, isOnline: users.isOnline })
    .from(users)
    .orderBy(users.name);

  return (
    <DiscordApp
      user={session.user}
      members={JSON.parse(JSON.stringify(members))}
    />
  );
}
