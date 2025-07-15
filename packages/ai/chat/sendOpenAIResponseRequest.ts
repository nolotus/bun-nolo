// sendOpenAIResponseRequest.ts

import {
  addActiveController,
  removeActiveController,
} from "chat/dialog/dialogSlice";
import {
  messageStreamEnd,
  messageStreaming,
  handleToolCalls,
} from "chat/messages/messageSlice";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import { performFetchRequest } from "./fetchUtils";
import { parseMultilineSSE } from "./parseMultilineSSE";
import { parseApiError } from "./parseApiError";
import { updateTotalUsage } from "./updateTotalUsage";
import { accumulateToolCallChunks } from "./accumulateToolCallChunks";
import { toolRegistry } from "../tools/toolRegistry";

type Segment = { type: "text"; text: string };

// 准备工具实例
function prepareTools(names: string[]): any[] {
  return names.map((n) => toolRegistry[n]).filter(Boolean);
}

// 不可变方式追加文本块
function appendTextChunk(buffer: Segment[], chunk: string): Segment[] {
  if (!chunk) return buffer;
  const last = buffer[buffer.length - 1];
  if (last?.type === "text") {
    return [...buffer.slice(0, -1), { ...last, text: last.text + chunk }];
  } else {
    return [...buffer, { type: "text", text: chunk }];
  }
}

export const sendOpenAIResponseRequest = async ({
  bodyData,
  agentConfig: cybotConfig,
  thunkApi,
  dialogKey,
  parentMessageId,
}: {
  bodyData: any;
  agentConfig: any;
  thunkApi: any;
  dialogKey: string;
  parentMessageId?: string;
}) => {
  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());
  const signal = controller.signal;

  // 生成 messageId 和 msgKey
  let messageId: string;
  let msgKey: string;
  if (parentMessageId) {
    messageId = parentMessageId;
    msgKey = `msg:${dialogId}:${messageId}`;
  } else {
    const ids = createDialogMessageKeyAndId(dialogId);
    messageId = ids.messageId;
    msgKey = ids.key;
  }

  // 注册中断控制器并派发开始流式消息
  dispatch(addActiveController({ messageId, controller }));
  dispatch(
    messageStreaming({
      id: messageId,
      dbKey: msgKey,
      content: "",
      role: "assistant",
      cybotKey: cybotConfig.dbKey,
      isStreaming: true,
    })
  );

  // 如果有工具调用，附加到请求体
  if (Array.isArray(cybotConfig.tools) && cybotConfig.tools.length > 0) {
    bodyData.tools = prepareTools(cybotConfig.tools);
    bodyData.tool_choice ??= "auto";
  }

  let contentBuffer: Segment[] = [];
  let totalUsage: any = null;
  let toolCalls: any[] = [];
  let reasoningBuffer = "";
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let hasHandedOff = false;

  // 流结束时的收尾
  const finalize = () => {
    if (hasHandedOff) return;
    dispatch(
      messageStreamEnd({
        finalContentBuffer: contentBuffer,
        totalUsage,
        msgKey,
        cybotConfig,
        dialogId,
        dialogKey,
        messageId,
        reasoningBuffer,
      })
    );
  };

  try {
    const api = getApiEndpoint(cybotConfig);
    const token = selectCurrentToken(getState());
    const response = await performFetchRequest({
      cybotConfig,
      api,
      bodyData,
      currentServer: selectCurrentServer(getState()),
      signal,
      token,
    });

    if (!response.ok) {
      const err = await parseApiError(response);
      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${err}]`);
      finalize();
      return;
    }

    reader = response.body?.getReader();
    if (!reader) {
      finalize();
      return;
    }

    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const parsedList = parseMultilineSSE(chunk);

      for (const data of Array.isArray(parsedList)
        ? parsedList
        : [parsedList]) {
        if (data.usage) {
          totalUsage = updateTotalUsage(totalUsage, data.usage);
        }
        if (data.error) {
          contentBuffer = appendTextChunk(
            contentBuffer,
            `\n[API Error: ${data.error.message}]`
          );
          await reader.cancel();
          break;
        }

        const choice = data.choices?.[0];
        if (!choice) continue;
        const delta = choice.delta || {};

        if (delta.reasoning_content) {
          reasoningBuffer += delta.reasoning_content;
        }
        if (Array.isArray(delta.tool_calls)) {
          toolCalls = accumulateToolCallChunks(toolCalls, delta.tool_calls);
        }

        const text = delta.content || "";
        if (text) {
          const newBuffer = appendTextChunk(contentBuffer, text);
          contentBuffer = newBuffer;
          dispatch(
            messageStreaming({
              id: messageId,
              dbKey: msgKey,
              content: newBuffer,
              thinkContent: reasoningBuffer,
              role: "assistant",
              cybotKey: cybotConfig.dbKey,
            })
          );
        }

        const finishReason = choice.finish_reason;
        if (finishReason) {
          if (finishReason === "tool_calls") {
            const result = await dispatch(
              handleToolCalls({
                accumulatedCalls: toolCalls,
                currentContentBuffer: contentBuffer,
                cybotConfig,
                messageId,
              })
            ).unwrap();
            contentBuffer = result.finalContentBuffer;
            hasHandedOff = result.hasHandedOff;
            if (hasHandedOff) {
              await reader.cancel();
            }
          } else if (finishReason !== "stop") {
            contentBuffer = appendTextChunk(
              contentBuffer,
              `\n[流结束原因: ${finishReason}]`
            );
          }
        }
      }
    }

    // 处理剩余未执行的工具调用
    if (toolCalls.length > 0) {
      const result = await dispatch(
        handleToolCalls({
          accumulatedCalls: toolCalls,
          currentContentBuffer: contentBuffer,
          cybotConfig,
          messageId,
        })
      ).unwrap();
      contentBuffer = result.finalContentBuffer;
      hasHandedOff = result.hasHandedOff;
    }

    finalize();
  } catch (error: any) {
    const msg =
      error.name === "AbortError" ? "[用户中断]" : `[错误: ${error.message}]`;
    contentBuffer = appendTextChunk(contentBuffer, msg);
    finalize();
  } finally {
    dispatch(removeActiveController(messageId));
    if (reader) {
      try {
        await reader.cancel();
      } catch {}
    }
  }
};
