// /integrations/openai/generateResponseRequestBody.ts
import { Agent, Message } from "app/types";
import { generatePrompt } from "ai/agent/generatePrompt";
import { Contexts } from "ai/types";

/**
 * 生成新版 Response API 请求体
 * @param agentConfig Agent 配置
 * @param msgs 历史消息列表（数组里每项为 { role, content, name?, tool_calls?, tool_call_id? }）
 * @param contexts 可选上下文
 */
export function generateResponseRequestBody(
  agentConfig: Agent,
  msgs: Message[],
  contexts?: Contexts
) {
  const promptContent = generatePrompt({
    agentConfig,
    language: navigator.language,
    contexts,
  });
  const promptMessage: Message = { role: "developer", content: promptContent };
  const input = [promptMessage, ...msgs];
  // 2. 构造请求体，只添加必需字段
  const body: Record<string, any> = {
    model: agentConfig.model,
    input,
    stream: true,
  };

  // 3. 按需添加可选字段

  if (agentConfig.temperature !== undefined) {
    body.temperature = agentConfig.temperature;
  }
  if (agentConfig.top_p !== undefined) {
    body.top_p = agentConfig.top_p;
  }
  if (agentConfig.max_tokens !== undefined) {
    body.max_output_tokens = agentConfig.max_tokens;
  }
  if (agentConfig.max_tool_calls !== undefined) {
    body.max_tool_calls = agentConfig.max_tool_calls;
  }
  if (agentConfig.user !== undefined) {
    body.user = agentConfig.user;
  }
  if (agentConfig.include !== undefined) {
    body.include = agentConfig.include;
  }
  if (agentConfig.metadata !== undefined) {
    body.metadata = agentConfig.metadata;
  }

  return body;
}
