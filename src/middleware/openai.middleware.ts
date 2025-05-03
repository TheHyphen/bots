import { MiddlewareHandler } from "hono";
import { createOpenAI } from "@ai-sdk/openai";
import { AppVariables, CloudflareBindings } from "../types";

export const openaiMiddleware: MiddlewareHandler<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  c.set(
    "openai",
    createOpenAI({
      apiKey: c.env.OPENAI_TOKEN,
    })
  );
  return next();
};
