import { MiddlewareHandler } from "hono";
import { AppVariables, CloudflareBindings } from "../types";

export const apiKeyMiddleware: MiddlewareHandler<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  const apiHeader = c.req.header("x-api") || c.req.query("apiKey");
  if (!apiHeader) {
    return c.json({ error: "API key is required" }, 401);
  }

  c.set("apiKey", apiHeader);
  return next();
};
