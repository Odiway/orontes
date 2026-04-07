import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const gameSessionStatusEnum = pgEnum("game_session_status", [
  "planned",
  "active",
  "completed",
  "cancelled",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat Messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game Sessions (oyun planları)
export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  game: text("game").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdById: uuid("created_by_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: gameSessionStatusEnum("status").default("planned").notNull(),
  maxPlayers: integer("max_players"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game Session Participants
export const sessionParticipants = pgTable("session_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => gameSessions.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  response: text("response").notNull().default("pending"), // "yes", "no", "maybe", "pending"
  respondedAt: timestamp("responded_at"),
});

// Polls (oylamalar)
export const polls = pgTable("polls", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  createdById: uuid("created_by_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Poll Options
export const pollOptions = pgTable("poll_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  pollId: uuid("poll_id")
    .references(() => polls.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
});

// Poll Votes
export const pollVotes = pgTable("poll_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  optionId: uuid("option_id")
    .references(() => pollOptions.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(), // "game_invite", "poll", "chat", "system"
  linkTo: text("link_to"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
