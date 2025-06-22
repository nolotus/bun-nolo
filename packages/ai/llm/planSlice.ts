// /plan/planSlice.ts

import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import { messageStreaming, messageStreamEnd } from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { createDialogMessageKeyAndId } from "database/keys";
import { runCybotId } from "ai/cybot/cybotSlice";
import { toolExecutors } from "ai/tools/toolRegistry";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";

// --- 常量定义 ---
// 用于在消息中识别这是由计划执行器生成的消息
const PLAN_EXECUTOR_CYBOT_KEY = "PLAN_EXECUTOR";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- Interfaces ---

export interface PlanState {
  planDetails: string;
  currentProgress: number;
}

export interface Step {
  id: string;
  title: string;
  call: {
    tool_name: string;
    parameters: any;
  };
  status: "pending" | "in-progress" | "completed" | "failed";
  details?: any;
  result?: any; // 将存储工具返回的 rawData
}

interface RunPlanArgs {
  dialogKey: string;
}

// 定义 plan slice 自身的状态
interface PlanSliceState {
  plan: PlanState | null;
  steps: Step[];
  currentStep: string | null;
}

// --- Initial State ---

const initialState: PlanSliceState = {
  plan: null,
  steps: [],
  currentStep: null,
};

// --- Helper for Plan Execution ---
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

  // 替换占位符 {{steps.step_id.result}}
  return params.replace(/\{\{steps\.([^}]+)\.result\}\}/g, (match, stepId) => {
    const referencedStep = allSteps.find((s) => s.id === stepId);
    if (
      referencedStep &&
      referencedStep.status === "completed" &&
      referencedStep.result !== undefined &&
      referencedStep.result !== null
    ) {
      // 如果结果是对象，则字符串化以便在参数中使用
      if (typeof referencedStep.result === "object") {
        return JSON.stringify(referencedStep.result);
      }
      return String(referencedStep.result);
    }
    console.warn(`无法解析引用：步骤 "${stepId}" 未完成或没有结果。`);
    return match; // 如果找不到，返回原始占位符
  });
};

// --- Slice Definition ---

const planSlice = createSliceWithThunks({
  name: "plan",
  initialState,
  reducers: (create) => ({
    setPlan: create.reducer((state, action: PayloadAction<PlanState>) => {
      state.plan = action.payload;
    }),
    updatePlanProgress: create.reducer(
      (state, action: PayloadAction<number>) => {
        if (state.plan) {
          state.plan.currentProgress = action.payload;
        }
      }
    ),
    // 这个 action 会在切换对话或删除对话时被调用
    clearPlan: create.reducer((state) => {
      state.plan = null;
      state.steps = [];
      state.currentStep = null;
    }),
    setSteps: create.reducer((state, action: PayloadAction<Step[]>) => {
      state.steps = action.payload;
    }),
    updateStep: create.reducer(
      (
        state,
        action: PayloadAction<{ id: string; updates: Partial<Step> }>
      ) => {
        const step = state.steps.find((s) => s.id === action.payload.id);
        if (step) {
          Object.assign(step, action.payload.updates);
        }
      }
    ),
    setCurrentStep: create.reducer(
      (state, action: PayloadAction<string | null>) => {
        state.currentStep = action.payload;
      }
    ),
    clearSteps: create.reducer((state) => {
      state.steps = [];
      state.currentStep = null;
    }),

    /**
     * @description 负责把 create_plan 生成的 steps 依次执行，并为每一步创建UI消息。
     * 此 thunk 由 createPlan 工具触发，在后台运行。
     */
    runPlanSteps: create.asyncThunk(
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

          dispatch(planSlice.actions.setCurrentStep(step.id));
          dispatch(
            planSlice.actions.updateStep({
              id: step.id,
              updates: { status: "in-progress" },
            })
          );

          // 为当前执行的每一步都创建一条新的、独立的消息
          const { key: msgKey, messageId } =
            createDialogMessageKeyAndId(dialogId);
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
              if (!task) {
                throw new Error(
                  `步骤 '${step.title}' 调用 'ask_ai_assistant' 时缺少 'task' 参数。`
                );
              }

              // 决定使用哪个 Cybot。优先使用步骤指定的，否则使用当前对话的默认 Cybot。
              let cybotIdToUse = assistant_id;
              if (!cybotIdToUse) {
                const dialogConfig = selectCurrentDialogConfig(currentState);
                if (dialogConfig?.cybots?.length) {
                  cybotIdToUse = dialogConfig.cybots[0];
                } else {
                  throw new Error(
                    `无法为步骤 '${step.title}' 决定使用哪个助手。未提供 assistant_id，且当前对话没有关联的助手。`
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
                throw new Error(`未知工具：${step.call.tool_name}`);
              toolResult = await executor(resolvedParameters, thunkApi, {
                parentMessageId: messageId,
              });
            }

            dispatch(
              planSlice.actions.updateStep({
                id: step.id,
                updates: { status: "completed", result: toolResult.rawData },
              })
            );

            // 成功后，结束当前步骤消息的流式传输
            await dispatch(
              messageStreamEnd({
                finalContentBuffer: [
                  {
                    type: "text",
                    text:
                      `✅ **${step.title} 完成**\n\n` +
                      (toolResult.displayData || "执行成功，结果已记录。"),
                  },
                ],
                totalUsage: null,
                msgKey,
                dialogId,
                dialogKey,
                messageId,
                cybotConfig: { dbKey: PLAN_EXECUTOR_CYBOT_KEY } as any,
                reasoningBuffer: "",
              })
            ).unwrap();
          } catch (e: any) {
            dispatch(
              planSlice.actions.updateStep({
                id: step.id,
                updates: { status: "failed", result: e.message },
              })
            );

            // 失败后，结束当前步骤消息的流式传输，并显示错误
            await dispatch(
              messageStreamEnd({
                finalContentBuffer: [
                  {
                    type: "text",
                    text: `❌ **${step.title} 失败**\n\n${e.message}`,
                  },
                ],
                totalUsage: null,
                msgKey,
                dialogId,
                dialogKey,
                messageId,
                cybotConfig: { dbKey: PLAN_EXECUTOR_CYBOT_KEY } as any,
                reasoningBuffer: "",
              })
            );
            // 中止后续所有步骤的执行
            break;
          }
        }
        dispatch(planSlice.actions.setCurrentStep(null));
      }
    ),
  }),
  selectors: {
    selectPlan: (state: RootState) => state.plan.plan,
    selectSteps: (state: RootState) => state.plan.steps,
    selectCurrentStepId: (state: RootState) => state.plan.currentStep,
  },
});

// --- Actions & Selectors Exports ---
export const {
  setPlan,
  updatePlanProgress,
  clearPlan,
  setSteps,
  updateStep,
  setCurrentStep,
  clearSteps,
  runPlanSteps,
} = planSlice.actions;

export default planSlice.reducer;

export const selectPlan = (state: RootState): PlanState | null =>
  state.plan.plan;
export const selectSteps = (state: RootState): Step[] => state.plan.steps;
export const selectCurrentStepId = (state: RootState): string | null =>
  state.plan.currentStep;
export const selectCurrentStepDetails = (state: RootState): Step | null => {
  if (!state.plan.currentStep) return null;
  return (
    state.plan.steps.find((step) => step.id === state.plan.currentStep) || null
  );
};
