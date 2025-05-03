import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { zValidator } from "@hono/zod-validator";
import { experimental_generateImage, generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { apiKeys, bots, messages } from "./db/schema";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { db: DrizzleD1Database; openai: OpenAIProvider; userId: number };
}>();

// Define validation schemas
const createBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().min(1, "Bot description is required"),
});

const createMessageSchema = z.object({
  message: z.string().min(1, "Message content is required"),
});

app.use("*", async (c, next) => {
  const apiHeader = c.req.header("x-api");
  if (!apiHeader) {
    return c.json({ error: "API key is required" }, 401);
  }

  c.set("db", drizzle(c.env.DB));
  c.set(
    "openai",
    createOpenAI({
      apiKey: c.env.OPENAI_TOKEN,
    })
  );

  const db = c.get("db");
  // get userId from apiKeys table
  const user = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, apiHeader))
    .get();
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  c.set("userId", user.id);
  next();
});

app.post("/bots", zValidator("json", createBotSchema), async (c) => {
  const db = c.get("db");
  const openai = c.get("openai");
  const userId = c.get("userId");

  const { name, description } = await c.req.json();

  const response = await experimental_generateImage({
    model: openai.imageModel("dall-e-3"),
    prompt: `A profile picture for a bot named ${name} with the description: ${description}`,
    n: 1,
  });

  const result = await db
    .insert(bots)
    .values({ name, description, userId, picture: response.image.base64 })
    .run();

  return c.json({ message: "Bot created!", bot: result });
});

app.get("/bots", async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get("userId");
  const result = await db
    .select()
    .from(bots)
    .where(eq(bots.userId, userId))
    .all();
  return c.json({ bots: result });
});

app.get("/bots/:id", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const botId = parseInt(c.req.param("id"));
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
  return c.json({ bot, messages: messagesList });
});

app.post(
  "/bots/:id/messages",
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

export default app;
