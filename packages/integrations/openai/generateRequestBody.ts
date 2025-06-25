// /integrations/openai/generateOpenAIRequestBody.ts

import { supportedReasoningModels } from "ai/llm/providers";
import { mapLanguage } from "app/i18n/mapLanguage";
import { Agent } from "app/types";

// -----------------------------------------------------------------------------
// 类型定义
// -----------------------------------------------------------------------------

type MessageContentPartText = { type: "text"; text: string };
type MessageContentPartImageUrl = {
  type: "image_url";
  image_url: { url: string; detail?: "low" | "high" | "auto" };
};
type MessageContentPart = MessageContentPartText | MessageContentPartImageUrl;

export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string | MessageContentPart[];
  name?: string;
  tool_calls?: any;
  tool_call_id?: string;
}

interface BuildRequestBodyOptions {
  model: string;
  messages: Message[];
  providerName: string;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  reasoning_effort?: string;
}

interface Contexts {
  currentUserContext?: string | null;
  smartReadContext?: string | null;
  historyContext?: string | null;
  botInstructionsContext?: string | null;
  botKnowledgeContext?: string | null;
}

// -----------------------------------------------------------------------------
// System Prompt 生成逻辑 (新整合)
// -----------------------------------------------------------------------------

/**
 * 创建带有标题和描述的上下文部分。
 */
const createContextSection = (
  title: string,
  description: string,
  content: string | null | undefined
): string => {
  if (!content) return "";
  return `## ${title}\n${description}\n\n${content}`;
};

// 这些严格的指令只应在有上下文时使用
const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided under "REFERENCE MATERIALS" are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.`;

/**
 * 根据配置和上下文生成完整的系统提示。
 */
const generatePrompt = (options: {
  agentConfig: Agent;
  language?: string;
  contexts?: Contexts;
}): string => {
  const { agentConfig, language = navigator.language, contexts = {} } = options;
  const { name, prompt: mainPrompt, id, dbKey } = agentConfig;
  const mappedLanguage = mapLanguage(language);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  // 1. 基础信息区 (始终存在)
  const baseInfo = [
    name ? `Your name is ${name}.` : "",
    dbKey ? `Your dbKey is ${dbKey}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
  ]
    .filter(Boolean)
    .join("\n");

  // 2. 核心人格与任务区 (由 mainPrompt 定义)
  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // 3. 上下文资料区 (动态构建)
  const contextSections = [
    createContextSection(
      "Instructional Documents",
      "Specific rules and processes.",
      contexts.botInstructionsContext
    ),
    createContextSection(
      "User's Current References",
      "(High priority, from user for this request.)",
      contexts.currentUserContext
    ),
    createContextSection(
      "Smart Context Analysis",
      "(Medium-high priority, likely relevant.)",
      contexts.smartReadContext
    ),
    createContextSection(
      "Conversation History References",
      "(Medium priority, from past messages.)",
      contexts.historyContext
    ),
    createContextSection(
      "Knowledge Base Documents",
      "(Reference priority, for general lookup.)",
      contexts.botKnowledgeContext
    ),
  ].filter(Boolean);

  let referenceMaterialsBlock = "";

  // 只有在真的有上下文时，才构建整个“参考资料”区块和其使用指令
  if (contextSections.length > 0) {
    const materials = contextSections.join("\n\n");
    referenceMaterialsBlock = [
      `--- REFERENCE MATERIALS ---`,
      materials,
      CONTEXT_USAGE_INSTRUCTIONS,
    ].join("\n\n");
  }

  // 4. 最终组装
  const finalPrompt = [baseInfo, corePersonaAndTask, referenceMaterialsBlock]
    .filter(Boolean)
    .join("\n\n");

  return finalPrompt;
};

// -----------------------------------------------------------------------------
// OpenAI 请求体构建逻辑
// -----------------------------------------------------------------------------

/**
 * 在消息列表前添加系统提示消息。
 */
const prependPromptMessage = (
  messages: Message[],
  agentConfig: Agent,
  language: string,
  contexts?: Contexts
): Message[] => {
  // 只有存在上下文或 agentConfig.prompt 时才生成
  if (!contexts && !agentConfig.prompt) {
    return messages;
  }

  const promptContent = generatePrompt({ agentConfig, language, contexts });

  if (promptContent.trim()) {
    const systemMessage: Message = { role: "system", content: promptContent };
    // 过滤掉已有的 system 消息，避免重复
    const userMessages = messages.filter((m) => m.role !== "system");
    return [systemMessage, ...userMessages];
  }
  return messages;
};

/**
 * 检查模型是否支持 reasoning_effort。
 */
const isModelSupportReasoningEffort = (model: string): boolean => {
  return supportedReasoningModels.includes(model);
};

/**
 * 构建 OpenAI API 请求体。
 */
const buildRequestBody = (options: BuildRequestBodyOptions): any => {
  const {
    model,
    messages,
    providerName,
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
    max_tokens,
    reasoning_effort,
  } = options;

  const bodyData: any = { model, messages, stream: true };

  if (
    ["google", "openrouter", "xai", "openai", "deepinfra"].includes(
      providerName
    )
  ) {
    bodyData.stream_options = { include_usage: true };
  }
  if (reasoning_effort && isModelSupportReasoningEffort(model)) {
    bodyData.reasoning_effort = reasoning_effort;
  }
  if (typeof temperature === "number") bodyData.temperature = temperature;
  if (typeof top_p === "number") bodyData.top_p = top_p;
  if (typeof frequency_penalty === "number")
    bodyData.frequency_penalty = frequency_penalty;
  if (typeof presence_penalty === "number")
    bodyData.presence_penalty = presence_penalty;
  if (typeof max_tokens === "number") bodyData.max_tokens = max_tokens;

  return bodyData;
};

/**
 * 主函数：生成完整的 OpenAI 请求体。
 */
export const generateOpenAIRequestBody = (
  agentConfig: Agent,
  providerName: string,
  messages: Message[],
  contexts?: Contexts
) => {
  // 1. 在消息队头插入 prompt (如果需要)
  const messagesWithPrompt = prependPromptMessage(
    messages,
    agentConfig,
    navigator.language,
    contexts
  );

  // 2. 构建请求体
  const requestBody = buildRequestBody({
    model: agentConfig.model,
    messages: messagesWithPrompt,
    providerName,
    temperature: agentConfig.temperature,
    top_p: agentConfig.top_p,
    frequency_penalty: agentConfig.frequency_penalty,
    presence_penalty: agentConfig.presence_penalty,
    max_tokens: agentConfig.max_tokens,
    reasoning_effort: agentConfig.reasoning_effort,
  });

  return requestBody;
};
