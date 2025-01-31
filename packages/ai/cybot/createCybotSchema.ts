import { z } from "zod";

export const createCybotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),

  provider: z.string().trim().min(1, "Provider is required"),

  model: z.string().trim().min(1, "Model is required"),

  customProviderUrl: z.string().trim().optional().or(z.string().length(0)),

  apiKey: z.string().trim().optional().or(z.string().length(0)),

  useServerProxy: z.boolean().default(true),

  prompt: z.string().trim().optional().or(z.string().length(0)),

  tools: z.array(z.string()).default([]),

  isPublic: z.boolean().default(false),

  greeting: z.string().trim().optional().or(z.string().length(0)),

  introduction: z.string().trim().optional().or(z.string().length(0)),

  inputPrice: z.number().min(0).default(0),

  outputPrice: z.number().min(0).default(0),
});

export type FormData = z.infer<typeof createCybotSchema>;
