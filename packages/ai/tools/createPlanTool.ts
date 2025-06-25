// 这是一个完整的、可直接使用的文件
// 它包含了 createPlan 工具的定义，以及支持并行执行和多种AI调用的 plan 逻辑

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setPlan,
  setSteps,
  updateStep,
  setCurrentStep,
  selectSteps,
  type Step,
  type ToolCall,
} from "ai/llm/planSlice";
import { runLlm, streamLlm, runAgent, streamAgent } from "ai/cybot/cybotSlice";
import { toolExecutors } from "ai/tools/toolRegistry";
import type { RootState } from "app/store";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { createDialogMessageKeyAndId } from "database/keys";

const PLAN_EXECUTOR_CYBOT_KEY = "PLAN_EXECUTOR";

// --- Schema (已优化描述以增强AI理解和使用效果) ---
export const createPlanFunctionSchema = {
  name: "createPlan",
  description:
    "用于处理需要多个工具协作、有顺序依赖或可并行执行的复杂任务。当你发现一个请求无法通过单次工具调用完成时，应优先使用本工具来制定并执行一个清晰、可靠的多步骤计划。",
  parameters: {
    type: "object",
    properties: {
      planTitle: {
        type: "string",
        description: "为整个计划的目标设定一个简明扼要的标题。",
      },
      strategy: {
        type: "string",
        description:
          "[至关重要] 详细阐述制定此计划的整体策略和思考过程。解释为什么选择这些步骤、它们如何协同工作、以及数据如何在步骤间传递，以最终达成目标。",
      },
      steps: {
        type: "array",
        description:
          "一个有序的步骤数组。每个步骤可以包含一个或多个工具调用，这些调用将在该步骤内并行执行。",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "步骤的唯一标识符 (例如 'fetch_data', 'step_2')。此ID用于在后续步骤中引用本步骤的执行结果。",
            },
            title: {
              type: "string",
              description: "对该步骤目标的简短、人类可读的描述。",
            },
            calls: {
              type: "array",
              description:
                "一个或多个工具调用的数组，它们将在本步骤内并行执行。",
              items: {
                type: "object",
                properties: {
                  tool_name: {
                    type: "string",
                    description:
                      "要调用的工具名称。可以是任何已注册的工具 (如 'executeSql', 'fetchWebpage')，也可以是特殊的AI助手调用 (ask_llm/stream_llm 用于简单问答，ask_agent/stream_agent 用于复杂任务处理)。",
                  },
                  parameters: {
                    type: "object",
                    description:
                      "调用工具所需的参数对象。要引用先前步骤的结果，请使用占位符 '{{steps.STEP_ID.result}}' 或 '{{steps.STEP_ID.result[INDEX]}}' (当结果是数组时)。AI调用必须包含 'task' 参数。示例: { 'query': 'SELECT * FROM {{steps.get_table_name.result[0]}}' }",
                  },
                },
                required: ["tool_name", "parameters"],
              },
            },
          },
          required: ["id", "title", "calls"],
        },
      },
    },
    required: ["planTitle", "strategy", "steps"],
  },
};

// --- 辅助函数 ---

/**
 * 解析参数中的占位符，将其替换为先前步骤的实际执行结果。
 * 支持递归解析对象和数组中的占位符。
 * @param params - 需要解析的参数，可以是任何类型。
 * @param allSteps - 所有步骤的当前状态数组。
 * @returns 解析后的参数。
 */
const resolveParameters = (params: any, allSteps: Step[]): any => {
  if (typeof params !== "string") {
    if (Array.isArray(params)) {
      return params.map((p) => resolveParameters(p, allSteps));
    }
    if (typeof params === "object" && params !== null) {
      return Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          resolveParameters(value, allSteps),
        ])
      );
    }
    return params;
  }

  // 正则表达式匹配 {{steps.step_id.result}} 或 {{steps.step_id.result[index]}}
  return params.replace(
    /\{\{steps\.([^}]+)\.result(\[\d+\])?\}\}/g,
    (match, stepId, indexPart) => {
      const referencedStep = allSteps.find((s) => s.id === stepId);
      if (
        !referencedStep ||
        referencedStep.status !== "completed" ||
        !referencedStep.result
      ) {
        console.warn(
          `无法解析引用：步骤 "${stepId}" 未完成或没有结果。将返回原始占位符。`
        );
        return match;
      }

      let result = referencedStep.result;
      if (indexPart) {
        const index = parseInt(indexPart.slice(1, -1), 10);
        if (Array.isArray(result) && index < result.length) {
          result = result[index];
        } else {
          console.warn(
            `无法解析引用：步骤 "${stepId}" 的结果中没有索引 ${index}。将返回原始占位符。`
          );
          return match;
        }
      }

      // 如果结果是对象或数组，序列化为字符串，否则直接转换为字符串
      if (typeof result === "object") {
        return JSON.stringify(result);
      }
      return String(result);
    }
  );
};

/**
 * 将参数对象格式化为易于阅读的Markdown字符串。
 * @param params - 参数对象。
 * @returns 格式化后的字符串。
 */
function formatParameters(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return "无";
  return Object.entries(params)
    .map(([key, value]) => `  - \`${key}\`: \`${JSON.stringify(value)}\``)
    .join("\n");
}

// --- 异步 Thunk: 计划执行器 ---

interface RunPlanArgs {
  dialogKey: string;
}

/**
 * 核心的计划执行Thunk。
 * 遍历计划中的每个步骤，并行执行该步骤内的所有工具调用，
 * 处理依赖关系、状态更新和用户界面消息。
 */
export const runPlanSteps = createAsyncThunk(
  "plan/runPlanSteps",
  async ({ dialogKey }: RunPlanArgs, thunkApi) => {
    const { getState, dispatch, signal } = thunkApi;
    const initialSteps = selectSteps(getState() as RootState);
    if (!initialSteps || initialSteps.length === 0) return;

    const dialogId = extractCustomId(dialogKey);

    for (const step of initialSteps) {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      // 1. 更新当前步骤状态为 "in-progress"
      dispatch(setCurrentStep(step.id));
      dispatch(updateStep({ id: step.id, updates: { status: "in-progress" } }));

      // 2. 在UI中显示步骤开始执行的消息
      const { key: msgKey, messageId: stepMessageId } =
        createDialogMessageKeyAndId(dialogId);
      dispatch(
        messageStreaming({
          id: stepMessageId,
          dbKey: msgKey,
          role: "assistant",
          content: `🔄 **正在执行: ${step.title}** (${step.calls.length}个任务并行)`,
          cybotKey: PLAN_EXECUTOR_CYBOT_KEY,
          isStreaming: true,
        })
      );

      try {
        // 3. 并行执行当前步骤的所有调用
        const currentState = getState() as RootState;
        const currentSteps = selectSteps(currentState);

        const callPromises = step.calls.map(async (call: ToolCall) => {
          // 解析参数，替换依赖项
          const resolvedParameters = resolveParameters(
            call.parameters,
            currentSteps
          );
          const { task, assistant_id } = resolvedParameters;

          const isAiCall = [
            "ask_llm",
            "stream_llm",
            "ask_agent",
            "stream_agent",
          ].includes(call.tool_name);
          let cybotIdToUse = assistant_id;
          if (isAiCall && !cybotIdToUse) {
            cybotIdToUse = selectCurrentDialogConfig(currentState)?.cybots?.[0];
            if (!cybotIdToUse)
              throw new Error(
                `在步骤 '${step.title}' 中无法为AI调用确定 assistant_id。`
              );
          }

          let result: { rawData: any; displayData: string };

          // 根据 tool_name 分派任务
          switch (call.tool_name) {
            case "ask_llm":
              const llmResult = await dispatch(
                runLlm({ content: task, cybotId: cybotIdToUse })
              ).unwrap();
              result = {
                rawData: llmResult,
                displayData: `**ask_llm**: ${llmResult}`,
              };
              break;
            case "stream_llm":
              await dispatch(
                streamLlm({ content: task, cybotId: cybotIdToUse })
              );
              result = {
                rawData: `[Streaming LLM task started]`,
                displayData: `**stream_llm**: 任务已开始，结果将作为独立消息展示。`,
              };
              break;
            case "ask_agent":
              const agentResult = await dispatch(
                runAgent({ content: task, cybotId: cybotIdToUse })
              ).unwrap();
              result = {
                rawData: agentResult,
                displayData: `**ask_agent**: ${agentResult}`,
              };
              break;
            case "stream_agent":
              await dispatch(
                streamAgent({ content: task, cybotId: cybotIdToUse })
              );
              result = {
                rawData: `[Streaming Agent task started]`,
                displayData: `**stream_agent**: 任务已开始，结果将作为独立消息展示。`,
              };
              break;
            default:
              const executor = toolExecutors[call.tool_name];
              if (!executor) throw new Error(`未知工具: ${call.tool_name}`);
              const toolResult = await executor(resolvedParameters, thunkApi, {
                parentMessageId: stepMessageId,
              });
              result = {
                ...toolResult,
                displayData: `**${call.tool_name}**: ${toolResult.displayData || "执行成功"}`,
              };
          }
          return result;
        });

        const toolResults = await Promise.all(callPromises);

        // 4. 更新步骤状态为 "completed" 并保存结果
        dispatch(
          updateStep({
            id: step.id,
            updates: {
              status: "completed",
              result: toolResults.map((res) => res.rawData),
            },
          })
        );

        // 5. 在UI中更新消息，显示步骤完成
        const finalContent = `✅ **${step.title} 完成**\n\n${toolResults.map((r) => r.displayData).join("\n")}`;
        await dispatch(
          messageStreamEnd({
            finalContentBuffer: [{ type: "text", text: finalContent }],
            msgKey,
            dialogId,
            dialogKey,
            messageId: stepMessageId,
            totalUsage: null,
            cybotConfig: { dbKey: PLAN_EXECUTOR_CYBOT_KEY } as any,
            reasoningBuffer: "",
          })
        );
      } catch (e: any) {
        // 6. 异常处理：更新步骤和UI为失败状态
        console.error(`步骤 ${step.id} 执行失败。`, e);
        dispatch(
          updateStep({
            id: step.id,
            updates: { status: "failed", result: [e.message] },
          })
        );
        await dispatch(
          messageStreamEnd({
            finalContentBuffer: [
              {
                type: "text",
                text: `❌ **${step.title} 失败**\n\n错误: ${e.message}`,
              },
            ],
            msgKey,
            dialogId,
            dialogKey,
            messageId: stepMessageId,
            totalUsage: null,
            cybotConfig: { dbKey: PLAN_EXECUTOR_CYBOT_KEY } as any,
            reasoningBuffer: "",
          })
        );
        // 如果有任何一步失败，则中断整个计划的执行
        break;
      }
    }

    // 7. 所有步骤执行完毕，重置当前步骤
    dispatch(setCurrentStep(null));
  }
);

// --- 工具主函数 ---

/**
 * createPlan 工具的执行器。
 * 当AI调用此工具时，本函数被触发。
 * 它负责解析AI生成的计划，将其存入Redux状态，然后启动 `runPlanSteps` Thunk 来异步执行该计划。
 * @param args - AI提供的符合 `createPlanFunctionSchema` 的参数。
 * @param thunkApi - Redux Thunk API。
 * @returns 一个包含Markdown格式化计划的对象，用于在UI中展示。
 */
export async function createPlanAndOrchestrateFunc(
  args: any,
  thunkApi: any
): Promise<{ rawData: string; displayData: string }> {
  const { dispatch, getState } = thunkApi;
  const { planTitle, strategy, steps: stepBlueprints } = args;

  if (
    !planTitle ||
    !strategy ||
    !Array.isArray(stepBlueprints) ||
    stepBlueprints.length === 0
  ) {
    throw new Error(
      "创建计划需要 'planTitle', 'strategy', 以及至少一个 'steps'。"
    );
  }

  // 1. 将AI生成的蓝图转换为内部状态格式
  const processedSteps: Step[] = stepBlueprints.map((blueprint: any) => ({
    id: blueprint.id,
    title: blueprint.title,
    status: "pending",
    calls: blueprint.calls || [],
    result: [],
  }));

  // 2. 在Redux中设置计划和步骤
  dispatch(setPlan({ planDetails: strategy, currentProgress: 0 }));
  dispatch(setSteps(processedSteps));

  // 3. 异步启动计划执行
  const state = getState() as RootState;
  const dialogKey = state.dialog.currentDialogKey;
  if (dialogKey) {
    dispatch(runPlanSteps({ dialogKey }));
  } else {
    console.error("无法执行计划: 未能获取到 currentDialogKey。");
    const errorMarkdown = `\n\n**严重错误:** 找不到当前对话。计划已创建但**不会被执行**。`;
    return { rawData: errorMarkdown, displayData: errorMarkdown };
  }

  // 4. 立即返回格式化的计划描述给用户界面
  const markdownResult = `
### 计划已创建: ${planTitle}

**策略:**
${strategy}

---

**执行步骤 (${processedSteps.length}):**

${processedSteps
  .map(
    (step, index) => `
**${index + 1}. ${step.title}** (\`ID: ${step.id}\`)
${step.calls
  .map(
    (call) => `
- **工具:** \`${call.tool_name}\`
- **参数:**
${formatParameters(call.parameters)}`
  )
  .join("")}`
  )
  .join("\n---\n")}

---
**计划已开始自动执行...**
`;
  return { rawData: markdownResult, displayData: markdownResult };
}
