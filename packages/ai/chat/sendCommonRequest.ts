// /ai/chat/sendCommonChatRequest.ts (Refactored for Clarity)
// 功能与原版完全相同，但通过提取辅助函数提高了代码的可读性。

import { prepareTools } from "ai/tools/prepareTools";
import {
  addActiveController,
  removeActiveController,
} from "chat/dialog/dialogSlice";
import {
  messageStreamEnd,
  messageStreaming,
  handleToolCalls,
} from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import { performFetchRequest } from "./fetchUtils";
import { parseMultilineSSE } from "./parseMultilineSSE";
import { parseApiError } from "./parseApiError";
import { updateTotalUsage } from "./updateTotalUsage";
import { accumulateToolCallChunks } from "./accumulateToolCallChunks";

// --- 辅助函数 ---

function appendTextChunk(buffer: any[], text: string): any[] {
  if (!text) return buffer;
  const newBuffer = [...buffer];
  const last = newBuffer[newBuffer.length - 1];
  if (last && last.type === "text") {
    last.text += text;
  } else {
    newBuffer.push({ type: "text", text });
  }
  return newBuffer;
}

// [新增] 辅助函数，处理单个流事件数据块
async function processStreamEvent({
  data,
  state,
  thunkApi,
  cybotConfig,
}: {
  data: any;
  state: any;
  thunkApi: any;
  cybotConfig: any;
}) {
  const { dispatch } = thunkApi;
  const { messageId, msgKey } = state;

  if (data.usage) {
    state.totalUsage = updateTotalUsage(state.totalUsage, data.usage);
  }

  if (data.error) {
    const errorMsg = `Error: ${data.error.message || JSON.stringify(data.error)}`;
    state.contentBuffer = appendTextChunk(
      state.contentBuffer,
      `\n[API Error] ${errorMsg}`
    );
    throw new Error("APIErrorInStream"); // 抛出特定错误以中止流
  }

  const choice = data.choices?.[0];
  if (!choice) return;

  const delta = choice.delta || {};
  if (delta.reasoning_content) {
    state.reasoningBuffer += delta.reasoning_content;
  }

  if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
    state.accumulatedToolCalls = accumulateToolCallChunks(
      state.accumulatedToolCalls,
      delta.tool_calls
    );
  }

  if (delta.content) {
    state.contentBuffer = appendTextChunk(state.contentBuffer, delta.content);
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: msgKey,
        content: state.contentBuffer,
        thinkContent: state.reasoningBuffer,
        role: "assistant",
        cybotKey: cybotConfig.dbKey,
      })
    );
  }

  if (choice.finish_reason) {
    if (choice.finish_reason === "tool_calls") {
      const result = await dispatch(
        handleToolCalls({
          accumulatedCalls: state.accumulatedToolCalls,
          currentContentBuffer: state.contentBuffer,
          cybotConfig,
          messageId,
        })
      ).unwrap();

      state.contentBuffer = result.finalContentBuffer;
      state.accumulatedToolCalls = []; // 重置

      if (result.hasHandedOff) {
        state.hasHandedOff = true;
        throw new Error("StreamHandedOff"); // 抛出特定错误以中止流
      }
    } else if (choice.finish_reason !== "stop") {
      state.contentBuffer = appendTextChunk(
        state.contentBuffer,
        `\n[流结束原因: ${choice.finish_reason}]`
      );
    }
  }
}

// --- 主流程：发送常规聊天请求 ---
export const sendCommonChatRequest = async ({
  bodyData,
  cybotConfig,
  thunkApi,
  dialogKey,
  parentMessageId,
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
  parentMessageId?: string;
}) => {
  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());

  const { key: msgKey, messageId } = parentMessageId
    ? { key: `msg:${dialogId}:${parentMessageId}`, messageId: parentMessageId }
    : createDialogMessageKeyAndId(dialogId);

  dispatch(addActiveController({ messageId, controller }));

  if (cybotConfig.tools?.length > 0) {
    bodyData.tools = prepareTools(cybotConfig.tools);
    bodyData.tool_choice = bodyData.tool_choice || "auto";
  }

  // 使用一个状态对象来管理所有可变状态
  const streamState = {
    contentBuffer: [] as any[],
    totalUsage: null,
    accumulatedToolCalls: [] as any[],
    reasoningBuffer: "",
    hasHandedOff: false,
    messageId,
    msgKey,
  };

  const finalize = () => {
    if (streamState.hasHandedOff) return;
    dispatch(
      messageStreamEnd({
        finalContentBuffer: streamState.contentBuffer,
        totalUsage: streamState.totalUsage,
        reasoningBuffer: streamState.reasoningBuffer,
        msgKey,
        cybotConfig,
        dialogId,
        dialogKey,
        messageId,
      })
    );
  };

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    if (!parentMessageId) {
      dispatch(
        messageStreaming({
          id: messageId,
          dbKey: msgKey,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
        })
      );
    }

    const response = await performFetchRequest({
      cybotConfig,
      api: getApiEndpoint(cybotConfig),
      bodyData,
      currentServer: selectCurrentServer(getState()),
      signal: controller.signal,
      token: selectCurrentToken(getState()),
    });

    if (!response.ok) {
      const errorMessage = await parseApiError(response);
      streamState.contentBuffer = appendTextChunk(
        streamState.contentBuffer,
        `[错误: ${errorMessage}]`
      );
    } else {
      reader = response.body?.getReader();
    }

    if (!reader) {
      finalize();
      return;
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 处理流结束后仍有未处理的工具调用的情况
        if (
          streamState.accumulatedToolCalls.length > 0 &&
          !streamState.hasHandedOff
        ) {
          const result = await dispatch(
            handleToolCalls({
              accumulatedCalls: streamState.accumulatedToolCalls,
              currentContentBuffer: streamState.contentBuffer,
              cybotConfig,
              messageId,
            })
          ).unwrap();
          streamState.contentBuffer = result.finalContentBuffer;
          if (result.hasHandedOff) streamState.hasHandedOff = true;
        }
        break; // 退出循环
      }

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        const dataList = Array.isArray(parsedData) ? parsedData : [parsedData];
        for (const data of dataList) {
          await processStreamEvent({
            data,
            state: streamState,
            thunkApi,
            cybotConfig,
          });
        }
      }
    }

    finalize();
  } catch (error: any) {
    if (
      error.message === "APIErrorInStream" ||
      error.message === "StreamHandedOff"
    ) {
      // 这些是控制流的“错误”，由 processStreamEvent 抛出以中止循环
      // 不需要额外处理，只需确保 finalize 被调用
    } else {
      const errorText =
        error.name === "AbortError"
          ? "\n[用户中断]"
          : `\n[错误: ${error.message || String(error)}]`;
      streamState.contentBuffer = appendTextChunk(
        streamState.contentBuffer,
        errorText
      );
    }
    finalize();
  } finally {
    dispatch(removeActiveController(messageId));
    reader?.cancel().catch(() => {});
  }
};
