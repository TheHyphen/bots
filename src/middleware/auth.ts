import { MiddlewareHandler } from "hono";
import { apiKeyMiddleware } from "./apiKeyMiddleware";
import { dbMiddleware } from "./dbMiddleware";
import { openaiMiddleware } from "./openaiMiddleware";
import { userValidationMiddleware } from "./userValidationMiddleware";
import { AppVariables, CloudflareBindings } from "../types";

// Composite middleware that combines all authentication related middleware
export const authMiddleware: MiddlewareHandler<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  // Execute middlewares in sequence
  await apiKeyMiddleware(c, async () => {
    await dbMiddleware(c, async () => {
      await openaiMiddleware(c, async () => {
        await userValidationMiddleware(c, next);
      });
    });
  });
};
