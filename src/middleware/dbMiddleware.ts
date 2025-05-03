import { MiddlewareHandler } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { AppVariables, CloudflareBindings } from "../types";

export const dbMiddleware: MiddlewareHandler<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  c.set("db", drizzle(c.env.DB));
  return next();
};
