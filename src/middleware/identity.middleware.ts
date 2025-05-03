import { eq } from "drizzle-orm";
import { MiddlewareHandler } from "hono";
import { apiKeys } from "../db/schema";
import { AppVariables, CloudflareBindings } from "../types";

export const identityMiddleware: MiddlewareHandler<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  const apiHeader = c.get("apiKey");
  const db = c.get("db");

  const knownApiKey = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, apiHeader))
    .get();

  if (!knownApiKey) {
    return c.json({ error: "User not found" }, 404);
  }

  c.set("userId", knownApiKey.userId);
  return next();
};
