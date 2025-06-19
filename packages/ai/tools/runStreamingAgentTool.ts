// runStreamingAgentTool.ts (完整、最终版本)

import { streamCybotId } from "ai/cybot/cybotSlice";

/**
 * Tool 定义：run_streaming_agent
 */
export const runStreamingAgentTool = {
  type: "function",
  function: {
    name: "run_streaming_agent",
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
  },
};

/**
 * Tool 执行函数：runStreamingAgentFunc
 * @param {object} args - LLM 提供的参数，如 { agentKey: "...", userInput: "..." }
 * @param {object} thunkApi - 包含 dispatch 和 getState 的 Redux Thunk API
 * @param {object} context - 包含父消息ID的上下文对象
 */
export async function runStreamingAgentFunc(
  args: { agentKey: string; userInput: string },
  thunkApi: any,
  context?: { parentMessageId: string } // ✨ 关键：接收上下文
) {
  const { dispatch } = thunkApi;
  const { agentKey, userInput } = args;

  if (!agentKey) {
    throw new Error("调用 'run_streaming_agent' 失败：缺少 'agentKey' 参数。");
  }
  if (!userInput) {
    throw new Error("调用 'run_streaming_agent' 失败：缺少 'userInput' 参数。");
  }

  try {
    // ✨ 关键：将 parentMessageId 传递给下一个 Thunk
    await dispatch(
      streamCybotId({
        cybotId: agentKey,
        userInput,
        parentMessageId: context?.parentMessageId,
      })
    ).unwrap();

    // 此函数不再需要返回任何东西，因为它已经把UI控制权完全交给了 streamCybotId
    return;
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`启动流式 Agent [${agentKey}] 会话时出错: ${msg}`);
  }
}
