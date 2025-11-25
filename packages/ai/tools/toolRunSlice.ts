// File: ai/tools/toolRunSlice.ts
import {
  createSlice,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import type { ToolBehavior } from "./toolRegistry";

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
      }>
    ) => {
      const { id, messageId, toolName, behavior, inputSummary, startedAt } =
        action.payload;
      toolRunAdapter.upsertOne(state.runs, {
        id,
        messageId,
        toolName,
        behavior,
        inputSummary,
        status: "running",
        startedAt: startedAt ?? Date.now(),
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
