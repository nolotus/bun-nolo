// /ai/tools/runStreamingAgentTool.ts (已更新至新架构)

import { streamAgentChatTurn } from "ai/cybot/cybotSlice";

/**
 * [Schema] 定义了 'runStreamingAgent' 工具的结构，供 LLM 调用。
 * 注意：根据新架构，我们只导出函数 schema 本身。
 */
export const runStreamingAgentFunctionSchema = {
  // 已从 'run_streaming_agent' 更新为 'runStreamingAgent'
  name: "runStreamingAgent",
  description:
    "调用一个指定的 Agent (智能代理)，并以流式方式处理用户输入，与其进行交互。适用于需要委托给特定领域专家 Agent 进行复杂查询或连续对话的场景。",
  parameters: {
    type: "object",
    properties: {
      agentKey: {
        type: "string",
        description: "要运行的 Agent 的唯一标识符 (Key)。",
      },
      userInput: {
        type: "string",
        description: "要发送给 Agent 的初始用户输入或问题。",
      },
    },
    required: ["agentKey", "userInput"],
  },
};

/**
 * [Executor] 'runStreamingAgent' 工具的执行函数。
 * 它会将对话控制权完全移交给另一个 Agent。
 * @param args - LLM 提供的参数，如 { agentKey: "...", userInput: "..." }
 * @param thunkApi - 包含 dispatch 和 getState 的 Redux Thunk API
 * @param context - 包含父消息ID的上下文对象
 *
 * @returns {void} - 这是一个特殊情况。此工具不返回数据，而是移交控制权。
 *                  messageSlice 中的 `processToolData` 会处理这种情况。
 */
export async function runStreamingAgentFunc(
  args: { agentKey: string; userInput: string },
  thunkApi: any,
  context?: { parentMessageId: string }
): Promise<void> {
  const { dispatch } = thunkApi;
  const { agentKey, userInput } = args;

  // 参数校验
  if (!agentKey) {
    // 错误信息中的名称已同步更新
    throw new Error("调用 'runStreamingAgent' 失败：缺少 'agentKey' 参数。");
  }
  if (!userInput) {
    throw new Error("调用 'runStreamingAgent' 失败：缺少 'userInput' 参数。");
  }

  try {
    // 将 parentMessageId 传递给 streamCybotId，以确保流式响应附加到正确的父消息
    await dispatch(
      streamAgentChatTurn({
        cybotId: agentKey,
        userInput,
        parentMessageId: context?.parentMessageId,
      })
    ).unwrap();
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`启动流式 Agent [${agentKey}] 会话时出错: ${msg}`);
  }
}
