// File: ai/tools/toolRunSlice.ts
import {
  createSlice,
  createEntityAdapter,
  EntityState,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import type { ToolBehavior, ToolInteraction } from "./toolRegistry";
import { findToolExecutor } from "./toolRegistry";

export type ToolRunStatus = "pending" | "running" | "succeeded" | "failed";

export interface ToolRun {
  id: string;
  messageId: string; // 这次工具调用属于哪条消息或步骤消息
  toolName: string;
  behavior?: ToolBehavior;
  inputSummary?: string;
  outputSummary?: string;
  status: ToolRunStatus;
  error?: string;
  startedAt: number;
  finishedAt?: number;

  // 交互模式（从 ToolDefinition 抄过来）
  interaction?: ToolInteraction;

  // 保存本次调用的完整参数，后续确认或重放时会用到
  input?: any;
}

const toolRunAdapter = createEntityAdapter<ToolRun>({
  selectId: (run) => run.id,
  sortComparer: (a, b) => a.startedAt - b.startedAt,
});

export interface ToolRunSliceState {
  runs: EntityState<ToolRun>;
}

const initialState: ToolRunSliceState = {
  runs: toolRunAdapter.getInitialState(),
};

export const createToolRunId = () =>
  `toolrun_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const toolRunSlice = createSlice({
  name: "toolRun",
  initialState,
  reducers: {
    toolRunStarted: (
      state,
      action: PayloadAction<{
        id: string;
        messageId: string;
        toolName: string;
        behavior?: ToolBehavior;
        inputSummary?: string;
        startedAt?: number;
        interaction?: ToolInteraction;
        input?: any;
      }>
    ) => {
      const {
        id,
        messageId,
        toolName,
        behavior,
        inputSummary,
        startedAt,
        interaction,
        input,
      } = action.payload;
      toolRunAdapter.upsertOne(state.runs, {
        id,
        messageId,
        toolName,
        behavior,
        inputSummary,
        status: "running",
        startedAt: startedAt ?? Date.now(),
        interaction,
        input,
      });
    },

    // ✅ 新增：把某个 ToolRun 状态设为 pending（用于“预览但未执行”的阶段）
    toolRunSetPending: (
      state,
      action: PayloadAction<{
        id: string;
      }>
    ) => {
      const { id } = action.payload;
      toolRunAdapter.updateOne(state.runs, {
        id,
        changes: {
          status: "pending",
        },
      });
    },

    toolRunSucceeded: (
      state,
      action: PayloadAction<{
        id: string;
        outputSummary?: string;
        finishedAt?: number;
      }>
    ) => {
      const { id, outputSummary, finishedAt } = action.payload;
      toolRunAdapter.updateOne(state.runs, {
        id,
        changes: {
          status: "succeeded",
          outputSummary,
          finishedAt: finishedAt ?? Date.now(),
        },
      });
    },
    toolRunFailed: (
      state,
      action: PayloadAction<{
        id: string;
        error: string;
        finishedAt?: number;
      }>
    ) => {
      const { id, error, finishedAt } = action.payload;
      toolRunAdapter.updateOne(state.runs, {
        id,
        changes: {
          status: "failed",
          error,
          finishedAt: finishedAt ?? Date.now(),
        },
      });
    },
    resetToolRunsForMessage: (
      state,
      action: PayloadAction<{ messageId: string }>
    ) => {
      const { messageId } = action.payload;
      const all = state.runs.ids as string[];
      const toRemove = all.filter((id) => {
        const run = state.runs.entities[id];
        return run?.messageId === messageId;
      });
      toolRunAdapter.removeMany(state.runs, toRemove);
    },
    resetAllToolRuns: (state) => {
      toolRunAdapter.removeAll(state.runs);
    },
  },
});

export const {
  toolRunStarted,
  toolRunSetPending, // ✅ 新导出
  toolRunSucceeded,
  toolRunFailed,
  resetToolRunsForMessage,
  resetAllToolRuns,
} = toolRunSlice.actions;

export default toolRunSlice.reducer;

// ===== selectors =====
const selectors = toolRunAdapter.getSelectors<RootState>(
  (state) => state.toolRun.runs
);

export const selectAllToolRuns = selectors.selectAll;

export const selectToolRunsByMessageId = (
  state: RootState,
  messageId: string
) => selectors.selectAll(state).filter((run) => run.messageId === messageId);

// 内部使用：按 id 获取
const getToolRunById = (state: RootState, id: string): ToolRun | undefined =>
  selectors.selectById(state, id);

// ===== 通用执行 thunk：基于已有 ToolRun.input 再次执行工具 =====
export const executeToolRun = createAsyncThunk(
  "toolRun/executeToolRun",
  async ({ id }: { id: string }, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const run = getToolRunById(state, id);

    if (!run) {
      throw new Error(`ToolRun not found: ${id}`);
    }
    if (!run.input) {
      throw new Error(`ToolRun ${id} has no input to execute with.`);
    }

    const { executor } = findToolExecutor(run.toolName);

    // 点击按钮时，把状态重新置为 running，方便 UI 显示“执行中…”
    thunkApi.dispatch(
      toolRunStarted({
        id: run.id,
        messageId: run.messageId,
        toolName: run.toolName,
        behavior: run.behavior,
        inputSummary: run.inputSummary,
        startedAt: Date.now(),
        interaction: run.interaction,
        input: run.input,
      })
    );

    try {
      const result = await executor(run.input, thunkApi, {
        parentMessageId: run.messageId,
      });

      thunkApi.dispatch(
        toolRunSucceeded({
          id: run.id,
          outputSummary: result?.displayData || "",
        })
      );

      return {
        id: run.id,
        rawData: result?.rawData,
        displayData: result?.displayData,
      };
    } catch (e: any) {
      const msg = e?.message || String(e);
      thunkApi.dispatch(
        toolRunFailed({
          id: run.id,
          error: msg,
        })
      );
      throw e;
    }
  }
);
