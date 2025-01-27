import { z } from "zod";

export const createCybotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  customProviderUrl: z.string().optional(),
  apiKey: z.string().optional(),
  useServerProxy: z.boolean(),
  prompt: z.string().optional(),
  tools: z.array(z.string()),
  isPublic: z.boolean(),
  greeting: z.string().optional(),
  introduction: z.string().optional(),
  inputPrice: z.number().optional(),
  outputPrice: z.number().optional(),
});
export type FormData = z.infer<typeof createCybotSchema>;
