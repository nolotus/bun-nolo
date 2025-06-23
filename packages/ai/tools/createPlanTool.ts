// 这是一个完整的、可直接使用的文件
// 它包含了 createPlan 工具的定义，以及从 planSlice 移动过来的 plan 执行逻辑

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setPlan,
  setSteps,
  updateStep,
  setCurrentStep,
  selectSteps,
  type Step,
} from "ai/llm/planSlice"; // 注意: 导入了更多的 action 和 selector
import { runCybotId } from "ai/cybot/cybotSlice";
import { toolExecutors } from "ai/tools/toolRegistry";
import type { RootState } from "app/store";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { createDialogMessageKeyAndId } from "database/keys";

// --- 常量定义 (从 planSlice 移动过来) ---
const PLAN_EXECUTOR_CYBOT_KEY = "PLAN_EXECUTOR";

// --- Schema (保持不变) ---
export const createPlanFunctionSchema = {
  name: "createPlan",
  description:
    "When a task requires multiple structured steps or sequential AI thinking to complete, use this tool to formulate and execute a detailed plan. Do not use for simple, single-step tasks.",
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
          "[Crucially Important] Detail the overall strategy and thought process for creating this plan. Explain why you chose these steps and how you expect them to work together to achieve the final goal. This ensures the plan's logic and correctness.",
      },
      steps: {
        type: "array",
        description:
          "An ordered sequence of steps that make up the plan. Subsequent steps can reference the output of previous steps using the '{{steps.step_id.result}}' syntax.",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "A unique identifier for the step (e.g., 'step_1'), used for referencing in subsequent steps.",
            },
            title: {
              type: "string",
              description:
                "A short, human-readable description of the step's objective.",
            },
            tool_name: {
              type: "string",
              description:
                "The name of the tool to be called. Includes a special 'ask_ai_assistant' tool for open-ended tasks requiring language understanding, generation, summarization, or transformation.",
            },
            parameters: {
              type: "object",
              description: `Provides the necessary parameters for the selected tool. If tool_name is 'ask_ai_assistant', the parameters must include 'task'. You can use '{{steps.step_id.result}}' to reference results from previous steps.`,
            },
          },
          required: ["id", "title", "tool_name", "parameters"],
        },
      },
    },
    required: ["planTitle", "strategy", "steps"],
  },
};

// --- 辅助函数 ---

// 辅助函数，用于解析步骤参数中的引用 (从 planSlice 移动过来)
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

  return params.replace(/\{\{steps\.([^}]+)\.result\}\}/g, (match, stepId) => {
    const referencedStep = allSteps.find((s) => s.id === stepId);
    if (
      referencedStep &&
      referencedStep.status === "completed" &&
      referencedStep.result !== undefined &&
      referencedStep.result !== null
    ) {
      if (typeof referencedStep.result === "object") {
        return JSON.stringify(referencedStep.result);
      }
      return String(referencedStep.result);
    }
    console.warn(`无法解析引用：步骤 "${stepId}" 未完成或没有结果。`);
    return match; // Return original placeholder if not found
  });
};

// 辅助函数，用于格式化参数显示
function formatParameters(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return "None";
  return Object.entries(params)
    .map(([key, value]) => `  - \`${key}\`: \`${JSON.stringify(value)}\``)
    .join("\n");
}

// --- 异步 Thunk (从 planSlice 移动并重构) ---

interface RunPlanArgs {
  dialogKey: string;
}

export const runPlanSteps = createAsyncThunk(
  "plan/runPlanSteps", // Action type prefix, 必须唯一
  async ({ dialogKey }: RunPlanArgs, thunkApi) => {
    const { getState, dispatch, signal } = thunkApi;
    const initialSteps = selectSteps(getState() as RootState);

    if (!initialSteps || initialSteps.length === 0) {
      console.warn("runPlanSteps: no steps to run");
      return;
    }

    const dialogId = extractCustomId(dialogKey);

    for (const step of initialSteps) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");

      dispatch(setCurrentStep(step.id));
      dispatch(updateStep({ id: step.id, updates: { status: "in-progress" } }));

      const { key: msgKey, messageId } = createDialogMessageKeyAndId(dialogId);

      dispatch(
        messageStreaming({
          id: messageId,
          dbKey: msgKey,
          role: "assistant",
          content: `🔄 **正在执行: ${step.title}**`,
          cybotKey: PLAN_EXECUTOR_CYBOT_KEY,
          isStreaming: true,
        })
      );

      try {
        const currentState = getState() as RootState;
        const currentSteps = selectSteps(currentState);
        const resolvedParameters = resolveParameters(
          step.call.parameters,
          currentSteps
        );
        let toolResult: { rawData: any; displayData: string };

        if (step.call.tool_name === "ask_ai_assistant") {
          const { task, assistant_id } = resolvedParameters;
          if (!task)
            throw new Error(
              `Step '${step.title}' is missing 'task' parameter.`
            );

          let cybotIdToUse = assistant_id;
          if (!cybotIdToUse) {
            const dialogConfig = selectCurrentDialogConfig(currentState);
            if (dialogConfig?.cybots?.length) {
              cybotIdToUse = dialogConfig.cybots[0];
            } else {
              throw new Error(
                `Could not determine which assistant to use for '${step.title}'.`
              );
            }
          }

          const resultText = await dispatch(
            runCybotId({ content: task, cybotId: cybotIdToUse })
          ).unwrap();
          toolResult = { rawData: resultText, displayData: resultText };
        } else {
          const executor = toolExecutors[step.call.tool_name];
          if (!executor)
            throw new Error(`Unknown tool: ${step.call.tool_name}`);
          toolResult = await executor(resolvedParameters, thunkApi, {
            parentMessageId: messageId,
          });
        }

        dispatch(
          updateStep({
            id: step.id,
            updates: { status: "completed", result: toolResult.rawData },
          })
        );

        await dispatch(
          messageStreamEnd({
            finalContentBuffer: [
              {
                type: "text",
                text: `✅ **${step.title} 完成**\n\n${toolResult.displayData || "执行成功，结果已记录。"}`,
              },
            ],
            msgKey,
            dialogId,
            dialogKey,
            messageId,
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
            updates: { status: "failed", result: e.message },
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
            messageId,
            totalUsage: null,
            cybotConfig: { dbKey: PLAN_EXECUTOR_CYBOT_KEY } as any,
            reasoningBuffer: "",
          })
        );
        break; // 失败时终止整个计划
      }
    }
    dispatch(setCurrentStep(null));
  }
);

// --- 工具主函数 (保持不变) ---

/**
 * 创建一个计划，显示它，然后派发执行 thunk 在后台运行，
 * 允许它向 UI 实时推送更新。
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
      "Plan title, strategy, and at least one step are required."
    );
  }

  // 1. 准备计划并存入 Redux state
  const processedSteps: Step[] = stepBlueprints.map((blueprint: any) => ({
    id: blueprint.id,
    title: blueprint.title,
    status: "pending",
    call: {
      tool_name: blueprint.tool_name,
      parameters: blueprint.parameters || {},
    },
    result: null,
  }));

  dispatch(setPlan({ planDetails: strategy, currentProgress: 0 }));
  dispatch(setSteps(processedSteps));

  // 2. 派发计划执行 thunk，但不要 await 它。
  //    这让它可以在后台运行并创建自己的消息。
  const state = getState() as RootState;
  const dialogKey = state.dialog.currentDialogKey;

  if (dialogKey) {
    dispatch(runPlanSteps({ dialogKey })); // "Fire-and-forget"
  } else {
    console.error(
      "Cannot execute plan: Could not retrieve currentDialogKey. The plan will not be executed."
    );
    const errorMarkdown = `\n\n**CRITICAL ERROR:** Could not find the current dialog. The plan was created but **will not be executed.**`;
    return {
      rawData: errorMarkdown,
      displayData: errorMarkdown,
    };
  }

  // 3. 立即向用户返回初始的计划概览消息。
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
- **Tool:** \`${step.call.tool_name}\`
- **Parameters:**
${formatParameters(step.call.parameters)}
`
  )
  .join("\n---\n")}

---
**Plan execution has started automatically...**
`;

  return {
    rawData: markdownResult,
    displayData: markdownResult,
  };
}
