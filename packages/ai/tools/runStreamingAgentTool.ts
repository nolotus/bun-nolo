import { streamCybotId } from "ai/cybot/cybotSlice";

/**
 * Tool 定义：run_streaming_agent
 * --------------------------------
 * 参数已从 agentId 更新为 agentKey。
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
          // **<-- 已从 agentId 更新为 agentKey**
          type: "string",
          description: "要运行的 Agent 的唯一标识符 (Key)。",
        },
        userInput: {
          type: "string",
          description: "要发送给 Agent 的初始用户输入或问题。",
        },
      },
      required: ["agentKey", "userInput"], // **<-- 已从 agentId 更新为 agentKey**
    },
  },
};

/**
 * Tool 执行函数：runStreamingAgentFunc
 * --------------------------------
 * 此函数的参数处理逻辑已同步更新。
 * @param {object} args - LLM 提供的参数，如 { agentKey: "...", userInput: "..." }
 * @param {object} thunkApi - 包含 dispatch 和 getState 的 Redux Thunk API
 */
export async function runStreamingAgentFunc(args, thunkApi) {
  const { dispatch } = thunkApi;
  const { agentKey, userInput } = args; // **<-- 已从 agentId 更新为 agentKey**

  // 参数校验
  if (!agentKey) {
    // **<-- 已从 agentId 更新为 agentKey**
    throw new Error("调用 'run_streaming_agent' 失败：缺少 'agentKey' 参数。");
  }
  if (!userInput) {
    throw new Error("调用 'run_streaming_agent' 失败：缺少 'userInput' 参数。");
  }

  try {
    // 异步 dispatch streamCybotId thunk。
    // **关键**: 将外部的 'agentKey' 映射回内部的 'cybotId'。
    await dispatch(
      streamCybotId({ cybotId: agentKey, userInput }) // **<-- 已从 agentId 更新为 agentKey**
    ).unwrap();

    // 向 LLM 返回确认信息，表明任务已成功启动。
    return {
      success: true,
      message: `与 Agent [${agentKey}] 的流式会话已成功启动。`, // **<-- 已从 agentId 更新为 agentKey**
    };
  } catch (error) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`启动流式 Agent [${agentKey}] 会话时出错: ${msg}`); // **<-- 已从 agentId 更新为 agentKey**
  }
}
