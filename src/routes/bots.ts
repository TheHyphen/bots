import { zValidator } from "@hono/zod-validator";
import { experimental_generateImage, generateObject } from "ai";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { bots } from "../db/schema";
import { AppVariables, CloudflareBindings } from "../types";
import { createBotSchema, getBotPictureUrl } from "../utils/botUtils";

// Create a Hono router for bot endpoints
const botRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

// Create a new bot
botRouter.post("/", zValidator("json", createBotSchema), async (c) => {
  const db = c.get("db");
  const openai = c.get("openai");
  const userId = c.get("userId");

  const { name, description } = await c.req.json();

  const {
    object: { prompt },
  } = await generateObject({
    model: openai("gpt-4o"),
    system:
      "You are a bot that simplifies the description of a bot and generates a prompt for profile pictures to feed to another image model",
    messages: [
      {
        role: "user",
        content: `Generate a prompt for a profile picture for a bot named ${name} with the description: ${description}`,
      },
    ],
    schema: z.object({
      prompt: z.string(),
    }),
  });

  const response = await experimental_generateImage({
    model: openai.imageModel("dall-e-3"),
    prompt,
    n: 1,
  });

  const result = await db
    .insert(bots)
    .values({ name, description, userId, picture: response.image.uint8Array })
    .returning({
      id: bots.id,
      name: bots.name,
      description: bots.description,
      userId: bots.userId,
      createdAt: bots.createdAt,
    })
    .run();

  const apiKey = c.get("apiKey");
  const botId = (result.results[0] as Record<string, any>).id;
  if (!botId) {
    return c.json({ error: "Error creating bot" }, 500);
  }

  const pictureUrl = getBotPictureUrl(c.req.url, botId, apiKey);
  return c.json({
    message: "Bot created!",
    bot: {
      ...(result.results[0] as Record<string, unknown>),
      pictureUrl,
    },
  });
});

// Get all bots for a user
botRouter.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const result = await db
    .select({
      id: bots.id,
      name: bots.name,
      description: bots.description,
      userId: bots.userId,
      createdAt: bots.createdAt,
    })
    .from(bots)
    .where(eq(bots.userId, userId))
    .all();

  const apiKey = c.get("apiKey");
  const botsList = result.map((bot) => ({
    ...(bot as Record<string, unknown>),
    pictureUrl: getBotPictureUrl(c.req.url, bot.id, apiKey),
  }));
  return c.json({ bots: botsList });
});

// Get a specific bot by ID
botRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const botId = parseInt(c.req.param("id"));
  const bot = await db
    .select({
      id: bots.id,
      name: bots.name,
      description: bots.description,
      userId: bots.userId,
      createdAt: bots.createdAt,
    })
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .get();
  if (!bot) {
    return c.json({ error: "Bot not found" }, 404);
  }

  const apiKey = c.get("apiKey");
  const pictureUrl = getBotPictureUrl(c.req.url, botId, apiKey);
  const botWithPictureUrl = {
    ...(bot as Record<string, unknown>),
    pictureUrl,
  };
  return c.json({ bot: botWithPictureUrl });
});

// Get a bot's picture
botRouter.get("/:id/picture", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const botId = parseInt(c.req.param("id"));
  const bot = await db
    .select({
      picture: bots.picture,
    })
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .get();
  if (!bot) {
    return c.json({ error: "Bot not found" }, 404);
  }

  return c.body(Buffer.from(bot.picture as Uint8Array), 200, {
    "Content-Type": "image/png",
  });
});

export default botRouter;
