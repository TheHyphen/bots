import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fdb4b1c849e79bb5a6d73ab641c53afea9aa6cf0d9745a1027cc8aa22a3f9974.sqlite",
  },
} satisfies Config;
