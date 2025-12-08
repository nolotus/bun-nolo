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

import type { Message, ToolPayload, ToolErrorPayload } from "./types"; // ✅ 从 types 引入
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

// ========= 工具函数：清洗带有模型标记的 tool arguments ===========

/**
 * 部分模型会在 tool.arguments 末尾追加内部标记
 * 如："<|tool_calls_section_end|>"，导致 JSON.parse 失败。
 * 这里在真正解析前做一次统一清洗。
 */
const TOOL_ARGS_SENTINELS = [
  "<|tool_calls_section_end|>",
  "<|tool_calls_end|>",
  "<|endofjson|>",
];

function cleanToolArguments(argStr: string): string {
  if (!argStr) return argStr;

  let cleaned = argStr;
  for (const s of TOOL_ARGS_SENTINELS) {
    const idx = cleaned.indexOf(s);
    if (idx >= 0) {
      cleaned = cleaned.slice(0, idx);
    }
  }

  return cleaned.trim();
}

// ========= processToolData ===========

const processToolData = createAsyncThunk(
  "message/processToolData",
  async (args: ProcessToolDataPayload, thunkApi: AppThunkApi) => {
    const { toolCall, parentMessageId } = args;
    const { dispatch, rejectWithValue } = thunkApi;

    console.log(
      "[ToolThunks/processToolData] ===== START ===== parentMessageId:",
      parentMessageId
    );
    console.log(
      "[ToolThunks/processToolData] incoming toolCall:",
      JSON.stringify(toolCall, null, 2)
    );

    const func = toolCall.function;
    if (!func || !func.name) {
      console.error(
        "[ToolThunks/processToolData] Invalid tool call data: missing function or function.name",
        toolCall
      );
      throw new Error(
        "Invalid tool call data: missing function or function.name"
      );
    }

    const rawToolName = func.name;
    let toolArgs = func.arguments;

    console.log(
      "[ToolThunks/processToolData] rawToolName:",
      rawToolName,
      "typeof arguments:",
      typeof toolArgs
    );

    let handler: any;
    let canonicalName: string;

    try {
      const found = findToolExecutor(rawToolName);
      handler = found.executor;
      canonicalName = found.canonicalName;
      console.log(
        "[ToolThunks/processToolData] findToolExecutor result -> canonicalName:",
        canonicalName,
        "handler exists:",
        !!handler
      );
    } catch (e: any) {
      console.error(
        "[ToolThunks/processToolData] findToolExecutor FAILED for rawToolName:",
        rawToolName,
        "error:",
        e
      );
      throw e;
    }

    // === 关键修复点：对字符串 arguments 先做清洗，再 JSON.parse ===
    if (typeof toolArgs === "string") {
      console.log(
        "[ToolThunks/processToolData] raw toolArgs string (first 200 chars):",
        String(toolArgs).slice(0, 200)
      );
      const cleaned = cleanToolArguments(toolArgs);
      console.log(
        "[ToolThunks/processToolData] cleaned toolArgs string (first 200 chars):",
        cleaned.slice(0, 200)
      );

      try {
        toolArgs = JSON.parse(cleaned);
        console.log(
          "[ToolThunks/processToolData] parsed toolArgs keys:",
          typeof toolArgs === "object" && toolArgs
            ? Object.keys(toolArgs)
            : "(non-object)"
        );
      } catch (e) {
        console.error(
          "[ToolThunks/processToolData] toolArgs JSON.parse failed. raw:",
          toolArgs
        );
        console.error(
          "[ToolThunks/processToolData] toolArgs after clean:",
          cleaned
        );
        throw new Error(`Failed to parse tool arguments JSON: ${e}`);
      }
    } else {
      console.log(
        "[ToolThunks/processToolData] toolArgs is non-string, value:",
        toolArgs
      );
    }

    const toolRunId = createToolRunId();
    const def = toolDefinitionsByName[canonicalName];
    const behavior = def?.behavior;
    const interaction = def?.interaction ?? "auto";
    const inputSummary = JSON.stringify(toolArgs).slice(0, 400);

    console.log(
      "[ToolThunks/processToolData] tool definition:",
      canonicalName,
      "behavior:",
      behavior,
      "interaction:",
      interaction
    );

    dispatch(
      toolRunStarted({
        id: toolRunId,
        messageId: parentMessageId,
        toolName: canonicalName,
        behavior,
        inputSummary,
        interaction,
        input: toolArgs,
      })
    );

    // ===== applyDiff：只做预览 + pending，不真正执行 =====
    if (canonicalName === "applyDiff") {
      console.log(
        "[ToolThunks/processToolData] special-case applyDiff preview path"
      );
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

        console.log(
          "[ToolThunks/processToolData] applyDiff preview completed, toolRunId:",
          toolRunId
        );

        // ✅ 构造可持久化的 toolPayload（预览状态）
        const toolPayload: ToolPayload = {
          toolName: canonicalName,
          status: "pending",
          input: toolArgs,
          rawToolCall: toolCall,
          rawResult: {
            previewOnly: true,
            filePath,
            diffPreview: preview,
          },
          toolRunId,
        };

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
          toolPayload,
        };
      } catch (e: any) {
        const errorMessage = e.message || "Unknown error in applyDiff preview";
        const errorContent = {
          type: "text",
          text: `\n[Tool Execution Error: ${rawToolName} (preview)] ${errorMessage}\n`,
        };

        console.error(
          "[ToolThunks/processToolData] applyDiff preview ERROR:",
          e
        );

        dispatch(
          toolRunFailed({
            id: toolRunId,
            error: errorMessage,
          })
        );

        const errorPayload: ToolErrorPayload = {
          type: e.name || "Error",
          message: errorMessage,
          code: e.code,
          retryable: e.retryable ?? true,
        };

        const toolPayload: ToolPayload = {
          toolName: canonicalName,
          status: "failed",
          input: toolArgs,
          rawToolCall: toolCall,
          error: errorPayload,
          toolRunId,
        };

        return rejectWithValue({
          displayContent: errorContent,
          rawResult: { error: errorMessage },
          toolName: canonicalName,
          toolRunId,
          toolPayload,
        });
      }
    }

    try {
      // runStreamingAgent：把对话交给子 Agent，不在当前消息继续输出
      if (canonicalName === "runStreamingAgent") {
        console.log(
          "[ToolThunks/processToolData] special-case runStreamingAgent path"
        );
        try {
          // 注意：这里假设模型传入的字段名为 agentKey / userInput
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

          console.log(
            "[ToolThunks/processToolData] runStreamingAgent handoff done, toolRunId:",
            toolRunId
          );

          const toolPayload: ToolPayload = {
            toolName: canonicalName,
            status: "succeeded",
            input: toolArgs,
            rawToolCall: toolCall,
            rawResult: {
              handedOff: true,
            },
            toolRunId,
          };

          return {
            hasHandedOff: true,
            toolName: canonicalName,
            toolRunId,
            toolPayload,
          };
        } catch (e: any) {
          const errorContent = {
            type: "text",
            text: `\n[Agent Failed to Start] ${e.message}\n`,
          };

          console.error(
            "[ToolThunks/processToolData] runStreamingAgent ERROR:",
            e
          );

          dispatch(
            toolRunFailed({
              id: toolRunId,
              error: e.message || "Unknown error in runStreamingAgent",
            })
          );

          const errorPayload: ToolErrorPayload = {
            type: e.name || "Error",
            message: e.message || String(e),
            code: e.code,
            retryable: e.retryable ?? false,
          };

          const toolPayload: ToolPayload = {
            toolName: canonicalName,
            status: "failed",
            input: toolArgs,
            rawToolCall: toolCall,
            error: errorPayload,
            toolRunId,
          };

          return rejectWithValue({
            displayContent: errorContent,
            toolName: canonicalName,
            toolRunId,
            toolPayload,
          });
        }
      }

      console.log(
        "[ToolThunks/processToolData] about to call handler for canonicalName:",
        canonicalName
      );

      const toolResult = await handler(toolArgs, thunkApi, {
        parentMessageId,
      });

      console.log(
        "[ToolThunks/processToolData] handler resolved. canonicalName:",
        canonicalName,
        "toolResult:",
        toolResult
      );

      let displayContent;
      const displayData = toolResult?.displayData;
      console.log(
        "[ToolThunks/processToolData] displayData (first 200 chars):",
        typeof displayData === "string"
          ? displayData.slice(0, 200)
          : JSON.stringify(displayData)?.slice(0, 200)
      );
      console.log(
        "[ToolThunks/processToolData] final toolArgs passed to handler:",
        toolArgs
      );

      if (canonicalName === "createPlan") {
        console.log(
          "[ToolThunks/processToolData] >>> entering createPlan branch"
        );

        displayContent = {
          type: "text",
          text: displayData || "[Plan executed, but no report was generated.]",
        };
      } else {
        console.log(
          "[ToolThunks/processToolData] normal tool branch, canonicalName:",
          canonicalName
        );
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

      console.log(
        "[ToolThunks/processToolData] toolRunSucceeded dispatched. toolRunId:",
        toolRunId,
        "canonicalName:",
        canonicalName
      );
      console.log("[ToolThunks/processToolData] ===== END (success) =====");

      const toolPayload: ToolPayload = {
        toolName: canonicalName,
        status: "succeeded",
        input: toolArgs,
        rawToolCall: toolCall,
        rawResult: toolResult.rawData,
        toolRunId,
      };

      return {
        displayContent,
        rawResult: toolResult.rawData,
        hasHandedOff: false,
        toolName: canonicalName,
        toolRunId,
        toolPayload,
      };
    } catch (e: any) {
      const errorMessage = e.message || "Unknown error";
      const errorContent = {
        type: "text",
        text: `\n[Tool Execution Error: ${rawToolName}] ${errorMessage}\n`,
      };

      console.error(
        "[ToolThunks/processToolData] ERROR in handler. rawToolName:",
        rawToolName,
        "canonicalName:",
        canonicalName,
        "error:",
        e
      );

      dispatch(
        toolRunFailed({
          id: toolRunId,
          error: errorMessage,
        })
      );

      console.log("[ToolThunks/processToolData] ===== END (error path) =====");

      const errorPayload: ToolErrorPayload = {
        type: e.name || "Error",
        message: errorMessage,
        code: e.code,
        retryable: e.retryable ?? true,
      };

      const toolPayload: ToolPayload = {
        toolName: canonicalName,
        status: "failed",
        input: toolArgs,
        rawToolCall: toolCall,
        error: errorPayload,
        toolRunId,
      };

      return rejectWithValue({
        displayContent: errorContent,
        rawResult: { error: errorMessage },
        toolName: canonicalName,
        toolRunId,
        toolPayload,
      });
    }
  }
);

// ========= handleToolCalls ===========
//
// 设计要点：
// - 不再把工具输出塞回当前 assistant 文本（保持 contentBuffer 纯净）
// - 但会：
//   * 始终写一条 role:"tool" 的消息
//   * 为自动 follow‑up 汇总 data 工具的文本
//   * 标记本轮是否出现 orchestrator / data 工具

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

    console.log(
      "[ToolThunks/handleToolCalls] ===== START ===== messageId:",
      messageId,
      "dialogId:",
      dialogId
    );
    console.log(
      "[ToolThunks/handleToolCalls] accumulatedCalls length:",
      accumulatedCalls.length
    );
    console.log(
      "[ToolThunks/handleToolCalls] accumulatedCalls detail:",
      JSON.stringify(accumulatedCalls, null, 2)
    );

    // 不再把 tool 输出塞回 assistant 文本，避免重复。
    const updatedContentBuffer = [...currentContentBuffer];
    let hasHandedOff = false;

    // 本轮工具调用的统计信息（用于自动 follow‑up）
    let toolTextForFollowup = "";
    let hadOrchestrator = false;
    let hasDataTool = false;

    for (const toolCall of accumulatedCalls) {
      if (!toolCall.function?.name) {
        console.warn(
          "[ToolThunks/handleToolCalls] skip toolCall without function.name:",
          toolCall
        );
        continue;
      }

      console.log(
        "[ToolThunks/handleToolCalls] processing toolCall.function.name:",
        toolCall.function.name
      );

      try {
        const result = await dispatch(
          processToolData({
            toolCall,
            parentMessageId: messageId,
          })
        ).unwrap();

        console.log(
          "[ToolThunks/handleToolCalls] processToolData result:",
          result
        );

        if (result.hasHandedOff) {
          console.log(
            "[ToolThunks/handleToolCalls] hasHandedOff = true, break loop."
          );
          hasHandedOff = true;
          break;
        }

        if (result.displayContent && result.toolName) {
          console.log(
            "[ToolThunks/handleToolCalls] creating tool message for toolName:",
            result.toolName
          );

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
            // ✅ 这里直接填进 Message
            toolName: result.toolName,
            parentMessageId: messageId,
            toolRunId: result.toolRunId,
            toolPayload: result.toolPayload,
          };

          // 1) 先更新 Redux 内存
          dispatch(addToolMessage(toolMessage));
          console.log(
            "[ToolThunks/handleToolCalls] tool message added to Redux. id:",
            toolMessageId,
            "toolName:",
            result.toolName
          );

          // 2) 再持久化到 DB（方式与助手消息一致）
          const { controller, ...messageToWrite } = toolMessage as any;
          await dispatch(
            write({
              data: { ...messageToWrite, type: DataType.MSG },
              customKey: toolDbKey,
            })
          );

          console.log(
            "[ToolThunks/handleToolCalls] tool message written to DB. dbKey:",
            toolDbKey
          );

          // === 统计本轮工具行为，用于自动 follow‑up ===
          const def = toolDefinitionsByName[result.toolName];
          const behavior = def?.behavior ?? "action";

          console.log(
            "[ToolThunks/handleToolCalls] tool behavior:",
            behavior,
            "for toolName:",
            result.toolName
          );

          if (behavior === "data") {
            hasDataTool = true;
            const text =
              (result.displayContent as any)?.text ??
              JSON.stringify(result.displayContent);
            if (text) {
              toolTextForFollowup += `\n${text}`;
            }
          } else if (behavior === "orchestrator") {
            hadOrchestrator = true;
          }
        } else {
          console.warn(
            "[ToolThunks/handleToolCalls] result without displayContent or toolName:",
            result
          );
        }
      } catch (rejectedValue: any) {
        console.error(
          "[ToolThunks/handleToolCalls] processToolData rejected. value:",
          rejectedValue
        );

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
            // ✅ 同样挂上
            toolName: rejectedValue.toolName,
            parentMessageId: messageId,
            toolRunId: rejectedValue.toolRunId,
            toolPayload: rejectedValue.toolPayload,
          };

          dispatch(addToolMessage(toolMessage));

          const { controller, ...messageToWrite } = toolMessage as any;
          await dispatch(
            write({
              data: { ...messageToWrite, type: DataType.MSG },
              customKey: toolDbKey,
            })
          );

          // 错误同样计入 data 工具输出，以便总结时能看到错误信息
          const def = toolDefinitionsByName[rejectedValue.toolName];
          const behavior = def?.behavior ?? "action";

          console.log(
            "[ToolThunks/handleToolCalls] rejected tool behavior:",
            behavior,
            "for toolName:",
            rejectedValue.toolName
          );

          if (behavior === "data") {
            hasDataTool = true;
            const text =
              (rejectedValue.displayContent as any)?.text ??
              JSON.stringify(rejectedValue.displayContent);
            if (text) {
              toolTextForFollowup += `\n${text}`;
            }
          } else if (behavior === "orchestrator") {
            hadOrchestrator = true;
          }
        }
      }

      // 不再调用 messageStreaming 更新 assistant 文本；
      // assistant 内容只来自模型自然语言回复。
    }

    console.log(
      "[ToolThunks/handleToolCalls] ===== END ===== hasHandedOff:",
      hasHandedOff,
      "hadOrchestrator:",
      hadOrchestrator,
      "hasDataTool:",
      hasDataTool
    );

    return {
      finalContentBuffer: updatedContentBuffer,
      hasHandedOff,
      toolTextForFollowup,
      hadOrchestrator,
      hasDataTool,
    };
  }
);
