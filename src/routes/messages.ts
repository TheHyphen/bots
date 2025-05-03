import { zValidator } from "@hono/zod-validator";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { bots, messages } from "../db/schema";
import { AppVariables, CloudflareBindings } from "../types";

export const createMessageSchema = z.object({
  message: z.string().min(1, "Message content is required"),
});

const messageRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

// Create a new message and get bot response
messageRouter.post(
  "/:id/messages",
  zValidator("json", createMessageSchema),
  async (c) => {
    const db = c.get("db");
    const openai = c.get("openai");
    const userId = c.get("userId");
    const botId = parseInt(c.req.param("id"));
    const { message } = await c.req.json();

    const bot = await db
      .select()
      .from(bots)
      .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
      .get();

    if (!bot) {
      return c.json({ error: "Bot not found" }, 404);
    }

    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.botId, botId))
      .orderBy(messages.createdAt)
      .all();

    const response = await generateText({
      model: openai("chatgpt-4o-latest"),
      system: bot.description!,
      messages: [
        ...messagesList.map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content,
        })),
        { role: "user", content: message },
      ],
    });

    if (!response) {
      return c.json({ error: "Error generating response" }, 500);
    }

    await db
      .insert(messages)
      .values({
        botId,
        role: "user",
        content: message,
      })
      .run();

    await db
      .insert(messages)
      .values({
        botId,
        role: "assistant",
        content: response.text,
      })
      .run();

    return c.json({ message: response.text });
  }
);

// Get all messages for a bot
messageRouter.get("/:id/messages", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const botId = parseInt(c.req.param("id"));

  // Verify bot ownership
  const botExists = await db
    .select({ id: bots.id })
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .get();

  if (!botExists) {
    return c.json({ error: "Bot not found" }, 404);
  }

  const messagesList = await db
    .select()
    .from(messages)
    .where(eq(messages.botId, botId))
    .orderBy(messages.createdAt)
    .all();

  return c.json({ messages: messagesList });
});

export default messageRouter;
