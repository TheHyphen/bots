import { z } from "zod";

// Helper function to generate bot picture URL
export function getBotPictureUrl(
  urlString: string,
  botId: number,
  apiKey: string
): string {
  const url = new URL(urlString);
  return `${url.protocol}//${url.host}/bots/${botId}/picture?apiKey=${apiKey}`;
}

// Validation schemas
export const createBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().min(1, "Bot description is required"),
});

export const createMessageSchema = z.object({
  message: z.string().min(1, "Message content is required"),
});
