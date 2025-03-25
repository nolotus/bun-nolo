import { z } from "zod";

export const createCybotSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    provider: z.string().trim().min(1, "Provider is required"),
    model: z.string().trim().min(1, "Model is required"),
    customProviderUrl: z
      .string()
      .trim()
      .optional()
      .or(z.string().length(0))
      .refine(
        (val) => {
          if (val && val.length > 0) {
            return z.string().url().safeParse(val).success;
          }
          return true;
        },
        { message: "Must be a valid URL when provided" }
      ),
    apiKey: z.string().trim().optional().or(z.string().length(0)),
    useServerProxy: z.boolean().default(true),
    prompt: z.string().trim().optional().or(z.string().length(0)),
    tools: z.array(z.string()).default([]),
    isPublic: z.boolean().default(false),
    greeting: z.string().trim().optional().or(z.string().length(0)),
    introduction: z.string().trim().optional().or(z.string().length(0)),
    inputPrice: z.number().min(0).default(0),
    outputPrice: z.number().min(0).default(0),
    tags: z.string().trim().optional().or(z.string().length(0)),
    references: z
      .array(
        z.object({
          type: z.string(), // 例如 "PAGE"
          dbKey: z.string(), // 页面标识符
          title: z.string(), // 页面标题
        })
      )
      .optional()
      .default([]), // 添加 references 字段，默认为空数组
  })
  // 在 createCybotSchema 中修改 refine 逻辑
  .refine(
    (data) => {
      // 不需要 API Key 的情况：
      // 1. 使用 server proxy
      // 2. provider 是 ollama
      // 3. provider 是 custom
      if (
        data.useServerProxy ||
        data.provider.toLowerCase() === "ollama" ||
        data.provider.toLowerCase() === "custom"
      ) {
        return true;
      }
      // 其他情况需要 API Key
      return !!data.apiKey;
    },
    {
      message:
        "API Key is required unless using Server Proxy, Ollama or Custom provider",
      path: ["apiKey"],
    }
  );

export type FormData = z.infer<typeof createCybotSchema>;
