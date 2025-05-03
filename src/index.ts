import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import botRouter from "./routes/bots";
import messageRouter from "./routes/messages";
import { AppVariables, CloudflareBindings } from "./types";
import { apiKeyMiddleware } from "./middleware/apiKeyMiddleware";
import { dbMiddleware } from "./middleware/dbMiddleware";
import { openaiMiddleware } from "./middleware/openaiMiddleware";
import { userValidationMiddleware } from "./middleware/userValidationMiddleware";

// Create the main Hono app
const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

app.use(
  "*",
  apiKeyMiddleware,
  dbMiddleware,
  openaiMiddleware,
  userValidationMiddleware
);

app.route("/bots", botRouter);
app.route("/bots", messageRouter);

export default app;
