// /integrations/openai/generateResponseRequestBody.ts
import { Agent, Message } from "app/types";
import { prependPromptMessage } from "ai/agent/prependPromptMessage";
import { Contexts } from "ai/types";

/** 把 legacy Message[] 转成新版 API 的 input 字段 */
function transformMessages(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
    name: m.name,
    tool_calls: m.tool_calls,
    tool_call_id: m.tool_call_id,
  }));
}

/** 生成新版 Response API 请求体 */
export function generateResponseRequestBody(
  agentConfig: Agent,
  messages: Message[],
  contexts?: Contexts
) {
  // 1. 插入 system prompt（如果有）
  const msgs = prependPromptMessage(
    messages,
    agentConfig,
    navigator.language,
    contexts
  );

  // 2. 填字段
  const body: Record<string, any> = {
    model: agentConfig.model,
    input: transformMessages(msgs),
    stream: agentConfig.stream ?? false,
    temperature: agentConfig.temperature ?? 1,
    top_p: agentConfig.top_p ?? 1,
    max_output_tokens: agentConfig.max_tokens,
    max_tool_calls: agentConfig.max_tool_calls,
    instructions: agentConfig.prompt ?? null,
    user: agentConfig.user ?? null,
    // 如果需要，还可以加 include、metadata、service_tier……
    include: agentConfig.include,
    metadata: agentConfig.metadata,
    service_tier: agentConfig.service_tier,
  };

  return body;
}
