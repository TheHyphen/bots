import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users } from "./db/schema";

// Define the CloudflareBindings interface
interface CloudflareBindings {
  DB: D1Database;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c) => {
  // Initialize Drizzle with D1
  const db = drizzle(c.env.DB);

  // Example query using Drizzle ORM
  const result = await db.select().from(users).all();

  return c.json({ message: "Hello Hono!", users: result });
});

// Example route for creating a user
app.post("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const newUser = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
    })
    .returning()
    .get();

  return c.json({ message: "User created", user: newUser });
});

export default app;
