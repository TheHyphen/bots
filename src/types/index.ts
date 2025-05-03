import { OpenAIProvider } from "@ai-sdk/openai";
import { DrizzleD1Database } from "drizzle-orm/d1";

export interface CloudflareBindings {
  DB: D1Database;
  OPENAI_TOKEN: string;
}

export interface AppVariables {
  db: DrizzleD1Database;
  openai: OpenAIProvider;
  userId: number;
  apiKey: string;
}
