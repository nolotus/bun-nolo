// chat/messages/toolThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { createDialogMessageKeyAndId } from "database/keys";
import type { AppThunkApi } from "app/store";

import { findToolExecutor, toolDefinitionsByName } from "ai/tools/toolRegistry";
import {
  toolRunStarted,
  toolRunSucceeded,
  toolRunFailed,
  createToolRunId,
  toolRunSetPending,
} from "ai/tools/toolRunSlice";
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";

import type { Message } from "./types";
import { addToolMessage } from "./messageSlice"; // 只导入 action，避免循环依赖过重

// ========= 类型：与原实现保持一致 ===========

export interface HandleToolCallsPayload {
  accumulatedCalls: any[];
  currentContentBuffer: any[];
  cybotConfig: any;
  messageId: string;
  dialogId: string;
}

export interface ProcessToolDataPayload {
  toolCall: any;
  parentMessageId: string;
}

// ========= processToolData ===========

export const processToolData = createAsyncThunk(
  "message/processToolData",
  async (args: ProcessToolDataPayload, thunkApi: AppThunkApi) => {
    const { toolCall, parentMessageId } = args;
    const { dispatch, rejectWithValue } = thunkApi;

    const func = toolCall.function;
    if (!func || !func.name) {
      throw new Error(
        "Invalid tool call data: missing function or function.name"
      );
    }

    const rawToolName = func.name;
    let toolArgs = func.arguments;

    const { executor: handler, canonicalName } = findToolExecutor(rawToolName);

    if (typeof toolArgs === "string") {
      try {
        toolArgs = JSON.parse(toolArgs);
      } catch (e) {
        throw new Error(`Failed to parse tool arguments JSON: ${e}`);
      }
    }

    const toolRunId = createToolRunId();
    const def = toolDefinitionsByName[canonicalName];
    const behavior = def?.behavior;
    const interaction = def?.interaction ?? "auto";
    const inputSummary = JSON.stringify(toolArgs).slice(0, 400);

    dispatch(
      toolRunStarted({
        id: toolRunId,
        messageId: parentMessageId,
        toolName: canonicalName,
        behavior,
        inputSummary,
        interaction,
        input: toolArgs, // ✅ 修复：之前的 input 未定义，这里必须用 toolArgs
      })
    );

    // ===== applyDiff：只做预览 + pending，不真正执行 =====
    if (canonicalName === "applyDiff") {
      try {
        const filePath = toolArgs?.filePath || "(未提供文件路径)";
        const diffText =
          typeof toolArgs?.diff === "string" ? toolArgs.diff : "";
        const maxLen = 400;
        const preview =
          diffText.length > maxLen
            ? diffText.slice(0, maxLen) +
              "\n...（已截断，仅展示前部分补丁内容）"
            : diffText;

        const textLines = [
          `你请求对文件 \`${filePath}\` 应用以下 diff：`,
          "",
          "```diff",
          preview,
          "```",
          "",
          "当前处于安全预览模式，本次不会真正应用补丁。",
          '请检查上面的 diff 是否正确，稍后可以点击 "应用这个补丁" 来真正执行。',
        ];
        const text = textLines.join("\n");

        const displayContent = {
          type: "text",
          text: `\n[applyDiff 预览]\n${text}\n`,
        };

        dispatch(
          toolRunSetPending({
            id: toolRunId,
          })
        );

        return {
          displayContent,
          rawResult: {
            previewOnly: true,
            filePath,
            diffPreview: preview,
            toolRunId,
          },
          hasHandedOff: false,
          toolName: canonicalName,
          toolRunId,
        };
      } catch (e: any) {
        const errorMessage = e.message || "Unknown error in applyDiff preview";
        const errorContent = {
          type: "text",
          text: `\n[Tool Execution Error: ${rawToolName} (preview)] ${errorMessage}\n`,
        };

        dispatch(
          toolRunFailed({
            id: toolRunId,
            error: errorMessage,
          })
        );

        return rejectWithValue({
          displayContent: errorContent,
          rawResult: { error: errorMessage },
          toolName: canonicalName,
          toolRunId,
        });
      }
    }

    try {
      // runStreamingAgent：把对话交给子 Agent，不在当前消息继续输出
      if (canonicalName === "runStreamingAgent") {
        try {
          await dispatch(
            streamAgentChatTurn({
              cybotId: toolArgs.agentKey,
              userInput: toolArgs.userInput,
              parentMessageId,
            })
          ).unwrap();

          dispatch(
            toolRunSucceeded({
              id: toolRunId,
              outputSummary: "[runStreamingAgent handed off to another agent]",
            })
          );

          return {
            hasHandedOff: true,
            toolName: canonicalName,
            toolRunId,
          };
        } catch (e: any) {
          const errorContent = {
            type: "text",
            text: `\n[Agent Failed to Start] ${e.message}\n`,
          };

          dispatch(
            toolRunFailed({
              id: toolRunId,
              error: e.message || "Unknown error in runStreamingAgent",
            })
          );

          return rejectWithValue({
            displayContent: errorContent,
            toolName: canonicalName,
            toolRunId,
          });
        }
      }

      const toolResult = await handler(toolArgs, thunkApi, {
        parentMessageId,
      });

      let displayContent;
      const displayData = toolResult?.displayData;

      if (canonicalName === "createPlan") {
        displayContent = {
          type: "text",
          text: displayData || "[Plan executed, but no report was generated.]",
        };
      } else {
        const text =
          displayData ||
          `${canonicalName.replace(/_/g, " ")} executed successfully.`;
        displayContent = {
          type: "text",
          text: `\n[Tool Result: ${text}]\n`,
        };
      }

      dispatch(
        toolRunSucceeded({
          id: toolRunId,
          outputSummary: displayData || "",
        })
      );

      return {
        displayContent,
        rawResult: toolResult.rawData,
        hasHandedOff: false,
        toolName: canonicalName,
        toolRunId,
      };
    } catch (e: any) {
      const errorMessage = e.message || "Unknown error";
      const errorContent = {
        type: "text",
        text: `\n[Tool Execution Error: ${rawToolName}] ${errorMessage}\n`,
      };

      dispatch(
        toolRunFailed({
          id: toolRunId,
          error: errorMessage,
        })
      );

      return rejectWithValue({
        displayContent: errorContent,
        rawResult: { error: errorMessage },
        toolName: canonicalName,
        toolRunId,
      });
    }
  }
);

// ========= handleToolCalls ===========

export const handleToolCalls = createAsyncThunk(
  "message/handleToolCalls",
  async (args: HandleToolCallsPayload, thunkApi: AppThunkApi) => {
    const {
      accumulatedCalls,
      currentContentBuffer,
      cybotConfig,
      messageId,
      dialogId,
    } = args;
    const { dispatch } = thunkApi;

    // 不再把 tool 输出塞回 assistant 文本，避免重复。
    const updatedContentBuffer = [...currentContentBuffer];
    let hasHandedOff = false;

    for (const toolCall of accumulatedCalls) {
      if (!toolCall.function?.name) continue;

      try {
        const result = await dispatch(
          processToolData({
            toolCall,
            parentMessageId: messageId,
          })
        ).unwrap();

        if (result.hasHandedOff) {
          hasHandedOff = true;
          break;
        }

        if (result.displayContent && result.toolName) {
          const { key: toolDbKey, messageId: toolMessageId } =
            createDialogMessageKeyAndId(dialogId);

          const toolMessage: Message = {
            id: toolMessageId,
            dbKey: toolDbKey,
            role: "tool",
            content: [result.displayContent],
            thinkContent: "",
            cybotKey: cybotConfig.dbKey,
            isStreaming: false,
          };

          (toolMessage as any).toolName = result.toolName;
          (toolMessage as any).parentMessageId = messageId;

          // 1) 先更新 Redux 内存
          dispatch(addToolMessage(toolMessage));

          // 2) 再持久化到 DB（方式与助手消息一致）
          const { controller, ...messageToWrite } = toolMessage;
          await dispatch(
            write({
              data: { ...messageToWrite, type: DataType.MSG },
              customKey: toolDbKey,
            })
          );
        }
      } catch (rejectedValue: any) {
        if (rejectedValue.displayContent && rejectedValue.toolName) {
          const { key: toolDbKey, messageId: toolMessageId } =
            createDialogMessageKeyAndId(dialogId);

          const toolMessage: Message = {
            id: toolMessageId,
            dbKey: toolDbKey,
            role: "tool",
            content: [rejectedValue.displayContent],
            thinkContent: "",
            cybotKey: cybotConfig.dbKey,
            isStreaming: false,
          };

          (toolMessage as any).toolName = rejectedValue.toolName;
          (toolMessage as any).parentMessageId = messageId;

          dispatch(addToolMessage(toolMessage));

          const { controller, ...messageToWrite } = toolMessage;
          await dispatch(
            write({
              data: { ...messageToWrite, type: DataType.MSG },
              customKey: toolDbKey,
            })
          );
        }
      }

      // 不再调用 messageStreaming 更新 assistant 文本；
      // assistant 内容只来自模型自然语言回复。
    }

    return { finalContentBuffer: updatedContentBuffer, hasHandedOff };
  }
);
