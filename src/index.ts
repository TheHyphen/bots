import { Hono } from "hono";
import { apiKeyMiddleware } from "./middleware/api-key.middleware";
import { dbMiddleware } from "./middleware/db.middleware";
import { identityMiddleware } from "./middleware/identity.middleware";
import { openaiMiddleware } from "./middleware/openai.middleware";
import botRouter from "./routes/bots";
import messageRouter from "./routes/messages";
import { AppVariables, CloudflareBindings } from "./types";

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
  identityMiddleware
);

app.route("/bots", botRouter);
app.route("/bots", messageRouter);

export default app;
