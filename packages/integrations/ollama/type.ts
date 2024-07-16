import { z } from "zod";

export const OllamaMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
});
