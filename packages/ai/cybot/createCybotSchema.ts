import { z } from "zod";

export const createCybotSchema = z.object({
  name: z.string().trim().min(1, "cybotNameRequired"),
  provider: z.string().trim().min(1, "Provider is required"),
  customProviderUrl: z.string().trim().optional(),
  model: z.string().trim().min(1, "Model is required"),
  apiKey: z.string().optional(),
  inputPrice: z.number().optional(),
  outputPrice: z.number().optional(),
  tools: z.array(z.string()),
  isPrivate: z.boolean(),
  isEncrypted: z.boolean(),
  useServerProxy: z.boolean(),
  prompt: z.string().trim().optional(),
  greeting: z.string().trim().optional(),
  introduction: z.string().trim().optional(),
});

export type FormData = z.infer<typeof createCybotSchema>;
