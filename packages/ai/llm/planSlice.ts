// /plan/planSlice.ts
// 这个文件现在只负责管理计划（Plan）的 Redux 状态。
// 计划的创建和执行逻辑已被移至相关的工具函数中。

import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "app/store";

// --- Interfaces (定义状态的数据结构) ---

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
  result?: any;
}

interface PlanSliceState {
  plan: PlanState | null;
  steps: Step[];
  currentStep: string | null;
}

// --- Initial State (初始状态) ---

const initialState: PlanSliceState = {
  plan: null,
  steps: [],
  currentStep: null,
};

// --- Slice Definition (状态切片定义) ---

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    // 设置整个计划的顶层信息
    setPlan: (state, action: PayloadAction<PlanState>) => {
      state.plan = action.payload;
    },
    // 更新计划的整体进度
    updatePlanProgress: (state, action: PayloadAction<number>) => {
      if (state.plan) {
        state.plan.currentProgress = action.payload;
      }
    },
    // 清除整个计划
    clearPlan: (state) => {
      state.plan = null;
      state.steps = [];
      state.currentStep = null;
    },
    // 设置计划的所有步骤
    setSteps: (state, action: PayloadAction<Step[]>) => {
      state.steps = action.payload;
    },
    // 更新单个步骤的状态或结果
    updateStep: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Step> }>
    ) => {
      const step = state.steps.find((s) => s.id === action.payload.id);
      if (step) {
        Object.assign(step, action.payload.updates);
      }
    },
    // 设置当前正在执行的步骤ID
    setCurrentStep: (state, action: PayloadAction<string | null>) => {
      state.currentStep = action.payload;
    },
    // 清除所有步骤信息
    clearSteps: (state) => {
      state.steps = [];
      state.currentStep = null;
    },
  },
  selectors: {
    selectPlanState: (state: PlanSliceState) => state.plan,
    selectStepsState: (state: PlanSliceState) => state.steps,
    selectCurrentStepIdState: (state: PlanSliceState) => state.currentStep,
  },
});

// --- Exports ---

// 导出 Actions，供其他地方 (如 thunks 或组件) dispatch
export const {
  setPlan,
  updatePlanProgress,
  clearPlan,
  setSteps,
  updateStep,
  setCurrentStep,
  clearSteps,
} = planSlice.actions;

// 导出 Reducer，用于 store 配置
export default planSlice.reducer;

// 导出方便使用的 Selectors，用于从根 state 中获取数据
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
