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
// 更新导入：引入所有需要的 thunk
import { runLlm, streamLlm, runAgent, streamAgent } from "ai/cybot/cybotSlice";
import { toolExecutors } from "ai/tools/toolRegistry";
import type { RootState } from "app/store";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { createDialogMessageKeyAndId } from "database/keys";

const PLAN_EXECUTOR_CYBOT_KEY = "PLAN_EXECUTOR";

// --- Schema (已更新以支持多种AI调用) ---
export const createPlanFunctionSchema = {
  name: "createPlan",
  description:
    "When a task requires multiple structured steps or tools, use this to formulate and execute a plan. Supports parallel execution and different AI call types.",
  parameters: {
    type: "object",
    properties: {
      planTitle: {
        type: "string",
        description:
          "A clear and concise title for the overall goal of the plan.",
      },
      strategy: {
        type: "string",
        description:
          "[Crucially Important] Detail the overall strategy and thought process for creating this plan. Explain why you chose these steps and how they work together to achieve the final goal.",
      },
      steps: {
        type: "array",
        description:
          "An ordered sequence of steps. Each step can contain one or more tool calls that will be executed in parallel.",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "A unique identifier for the step (e.g., 'step_1'), used for referencing results in subsequent steps.",
            },
            title: {
              type: "string",
              description:
                "A short, human-readable description of the step's objective.",
            },
            calls: {
              type: "array",
              description:
                "An array of one or more tool calls to be executed in parallel within this step.",
              items: {
                type: "object",
                properties: {
                  tool_name: {
                    type: "string",
                    description:
                      "The tool to call. Can be a registered tool or one of the AI assistants.",
                    enum: [
                      "ask_llm",
                      "stream_llm",
                      "ask_agent",
                      "stream_agent",
                    ],
                  },
                  parameters: {
                    type: "object",
                    description:
                      "Parameters for the tool. For AI calls, this must include 'task' and optionally 'assistant_id'. Use '{{steps.step_id.result[index]}}' for dependencies.",
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
const resolveParameters = (params: any, allSteps: Step[]): any => {
  if (typeof params !== "string") {
    if (Array.isArray(params))
      return params.map((p) => resolveParameters(p, allSteps));
    if (typeof params === "object" && params !== null)
      return Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          resolveParameters(value, allSteps),
        ])
      );
    return params;
  }
  return params.replace(
    /\{\{steps\.([^}]+)\.result(\[\d+\])?\}\}/g,
    (match, stepId, indexPart) => {
      const referencedStep = allSteps.find((s) => s.id === stepId);
      if (
        !referencedStep ||
        referencedStep.status !== "completed" ||
        !referencedStep.result
      ) {
        console.warn(`无法解析引用：步骤 "${stepId}" 未完成或没有结果。`);
        return match;
      }
      let result = referencedStep.result;
      if (indexPart) {
        const index = parseInt(indexPart.slice(1, -1), 10);
        if (Array.isArray(result) && index < result.length)
          result = result[index];
        else {
          console.warn(
            `无法解析引用：步骤 "${stepId}" 的结果中没有索引 ${index}。`
          );
          return match;
        }
      }
      if (typeof result === "object") return JSON.stringify(result);
      return String(result);
    }
  );
};

function formatParameters(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return "None";
  return Object.entries(params)
    .map(([key, value]) => `  - \`${key}\`: \`${JSON.stringify(value)}\``)
    .join("\n");
}

// --- 异步 Thunk (已重构以支持所有调用类型) ---
interface RunPlanArgs {
  dialogKey: string;
}
export const runPlanSteps = createAsyncThunk(
  "plan/runPlanSteps",
  async ({ dialogKey }: RunPlanArgs, thunkApi) => {
    const { getState, dispatch, signal } = thunkApi;
    const initialSteps = selectSteps(getState() as RootState);
    if (!initialSteps || initialSteps.length === 0) return;
    const dialogId = extractCustomId(dialogKey);
    for (const step of initialSteps) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      dispatch(setCurrentStep(step.id));
      dispatch(updateStep({ id: step.id, updates: { status: "in-progress" } }));
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
        const currentState = getState() as RootState;
        const currentSteps = selectSteps(currentState);
        const callPromises = step.calls.map(async (call: ToolCall) => {
          const resolvedParameters = resolveParameters(
            call.parameters,
            currentSteps
          );
          const { task, assistant_id } = resolvedParameters;
          let cybotIdToUse =
            assistant_id ||
            selectCurrentDialogConfig(currentState)?.cybots?.[0];
          const isAiCall =
            call.tool_name.includes("agent") || call.tool_name.includes("llm");
          if (isAiCall && !cybotIdToUse)
            throw new Error(
              `Could not determine assistant for AI call in step '${step.title}'.`
            );
          if (isAiCall && !task)
            throw new Error(
              `AI call in step '${step.title}' is missing 'task' parameter.`
            );
          let result: { rawData: any; displayData: string };
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
              // *** 关键修正：不再传递 parentMessageId ***
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
              // *** 关键修正：不再传递 parentMessageId ***
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
              if (!executor) throw new Error(`Unknown tool: ${call.tool_name}`);
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
        dispatch(
          updateStep({
            id: step.id,
            updates: {
              status: "completed",
              result: toolResults.map((res) => res.rawData),
            },
          })
        );
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
        console.error(`Step ${step.id} FAILED.`, e);
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
                text: `❌ **${step.title} 失败**\n\n${e.message}`,
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
        break;
      }
    }
    dispatch(setCurrentStep(null));
  }
);

// --- 工具主函数 ---
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
      "Plan title, strategy, and at least one step are required."
    );
  }
  const processedSteps: Step[] = stepBlueprints.map((blueprint: any) => ({
    id: blueprint.id,
    title: blueprint.title,
    status: "pending",
    calls: blueprint.calls || [],
    result: [],
  }));
  dispatch(setPlan({ planDetails: strategy, currentProgress: 0 }));
  dispatch(setSteps(processedSteps));
  const state = getState() as RootState;
  const dialogKey = state.dialog.currentDialogKey;
  if (dialogKey) {
    dispatch(runPlanSteps({ dialogKey }));
  } else {
    console.error("Cannot execute plan: Could not retrieve currentDialogKey.");
    const errorMarkdown = `\n\n**CRITICAL ERROR:** Could not find the current dialog. The plan was created but **will not be executed.**`;
    return { rawData: errorMarkdown, displayData: errorMarkdown };
  }
  const markdownResult = `
### Plan Created: ${planTitle}

**Strategy:**
${strategy}

---

**Execution Steps (${processedSteps.length}):**

${processedSteps
  .map(
    (step, index) => `
**${index + 1}. ${step.title}** (\`ID: ${step.id}\`)
${step.calls
  .map(
    (call) => `
- **Tool:** \`${call.tool_name}\`
- **Parameters:**
${formatParameters(call.parameters)}`
  )
  .join("")}`
  )
  .join("\n---\n")}

---
**Plan execution has started automatically...**
`;
  return { rawData: markdownResult, displayData: markdownResult };
}
