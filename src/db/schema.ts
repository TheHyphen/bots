import { sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Example table for users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  lastUsed: integer("last_used", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const bots = sqliteTable("bots", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  picture: blob("picture"),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  botId: integer("bot_id")
    .notNull()
    .references(() => bots.id),
  role: text("role").notNull(),
});
