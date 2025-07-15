// sendOpenAIResponseRequest.ts (Final Version with Full Logging)

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

function prepareTools(names: string[]): any[] {
  return names.map((n) => toolRegistry[n]).filter(Boolean);
}

function appendTextChunk(buffer: Segment[], chunk: string): Segment[] {
  if (!chunk) return buffer;
  const last = buffer[buffer.length - 1];
  if (last?.type === "text") {
    return [...buffer.slice(0, -1), { ...last, text: last.text + chunk }];
  }
  return [...buffer, { type: "text", text: chunk }];
}

/**
 * 发送 OpenAI 流式请求，同时将所有日志累积到一个字符串中返回。
 * @returns {Promise<string>} 完整的日志文本。
 */
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
}): Promise<string> => {
  const logs: string[] = [];

  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);

  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());
  const signal = controller.signal;

  let messageId: string, msgKey: string;
  if (parentMessageId) {
    messageId = parentMessageId;
    msgKey = `msg:${dialogId}:${messageId}`;
    logs.push(`[INIT] 使用 parentMessageId=${parentMessageId}`);
  } else {
    const ids = createDialogMessageKeyAndId(dialogId);
    messageId = ids.messageId;
    msgKey = ids.key;
    logs.push(`[INIT] 新建 messageId=${messageId}, msgKey=${msgKey}`);
  }

  dispatch(addActiveController({ messageId, controller }));
  dispatch(
    messageStreaming({
      id: messageId,
      dbKey: msgKey,
      content: "",
      thinkContent: "",
      role: "assistant",
      cybotKey: cybotConfig.dbKey,
      isStreaming: true,
    })
  );
  logs.push(`[ACTION] dispatch messageStreaming`);

  if (Array.isArray(cybotConfig.tools) && cybotConfig.tools.length > 0) {
    bodyData.tools = prepareTools(cybotConfig.tools);
    logs.push(`[TOOLS] 附加工具: ${JSON.stringify(cybotConfig.tools)}`);
  }
  bodyData.stream ??= true;
  logs.push(`[STREAM] bodyData.stream = true`);

  let contentBuffer: Segment[] = [];
  let reasoningBuffer = "";
  let summaryBuffer = "";
  let totalUsage: any = null;
  let toolCalls: any[] = [];
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let hasFinalized = false;

  const finalize = () => {
    if (hasFinalized) {
      logs.push(`[FINALIZE] 已执行过 finalize，跳过`);
      return;
    }
    hasFinalized = true;
    logs.push(`[FINALIZE] 开始 finalize`);
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
    logs.push(`[ACTION] dispatch messageStreamEnd`);
  };

  try {
    const api = getApiEndpoint(cybotConfig);
    const token = selectCurrentToken(getState());
    logs.push(`[FETCH] POST ${api} body=${JSON.stringify(bodyData)}`);
    const response = await performFetchRequest({
      cybotConfig,
      api,
      bodyData,
      currentServer: selectCurrentServer(getState()),
      signal,
      token,
    });
    logs.push(`[FETCH RESULT] status=${response.status}`);

    if (!response.ok) {
      const err = await parseApiError(response);
      logs.push(`[ERROR] HTTP ${response.status}: ${err}`);
      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${err}]`);
      finalize();
      return logs.join("\n");
    }

    reader = response.body?.getReader();
    if (!reader) {
      logs.push(`[WARN] response.body 没有 reader`);
      finalize();
      return logs.join("\n");
    }

    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        logs.push(`[STREAM] reader.done`);
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      logs.push(`[CHUNK] ${chunk}`);

      const events = parseMultilineSSE(chunk);
      const list = Array.isArray(events) ? events : [events];
      logs.push(
        `[PARSE] 解析到 ${list.length} 个事件，类型：[${list
          .map((e) => e.type)
          .join(", ")}]`
      );

      for (const event of list) {
        logs.push(`[EVENT] ${JSON.stringify(event)}`);

        if (event.usage) {
          totalUsage = updateTotalUsage(totalUsage, event.usage);
          logs.push(`[USAGE] 更新 totalUsage=${JSON.stringify(totalUsage)}`);
        }

        if (event.type === "error") {
          const msg = event.message || "Unknown error";
          logs.push(`[ERROR] SSE error: ${msg}`);
          contentBuffer = appendTextChunk(contentBuffer, `\n[Error: ${msg}]`);
          await reader.cancel();
          finalize();
          return logs.join("\n");
        }

        switch (event.type) {
          case "response.queued":
          case "response.in_progress":
          case "response.created":
          case "response.output_item.added":
          case "response.content_part.added":
            logs.push(`[SKIP] 忽略启动/状态事件: ${event.type}`);
            continue;

          case "response.output_text.delta":
            if (event.delta) {
              logs.push(`[APPEND DELTA] 追加文本: "${event.delta}"`);
              contentBuffer = appendTextChunk(contentBuffer, event.delta);
              dispatch(
                messageStreaming({
                  id: messageId,
                  dbKey: msgKey,
                  content: contentBuffer,
                  thinkContent: reasoningBuffer,
                  role: "assistant",
                  cybotKey: cybotConfig.dbKey,
                })
              );
            }
            continue;

          case "response.output_text.done":
          case "response.content_part.done":
          case "response.output_item.done":
            logs.push(`[SKIP] 忽略含冗余文本的 done 事件: ${event.type}`);
            continue;

          case "response.failed": {
            const msg = event.response?.error?.message || "Request failed";
            logs.push(`[FAILED] ${msg}`);
            contentBuffer = appendTextChunk(
              contentBuffer,
              `\n[API Failed: ${msg}]`
            );
            await reader.cancel();
            finalize();
            return logs.join("\n");
          }

          case "response.incomplete": {
            const r =
              event.response?.incomplete_details?.reason || "incomplete";
            logs.push(`[INCOMPLETE] reason=${r}`);
            contentBuffer = appendTextChunk(
              contentBuffer,
              `\n[Incomplete: ${r}]`
            );
            await reader.cancel();
            finalize();
            return logs.join("\n");
          }

          case "response.completed":
            logs.push(`[COMPLETED] 流结束，准备 finalize`);
            await reader.cancel();
            finalize();
            return logs.join("\n");

          case "response.reasoning.delta":
            if (event.delta?.text) {
              logs.push(`[REASONING DELTA] ${event.delta.text}`);
              reasoningBuffer += event.delta.text;
            }
            continue;
          case "response.reasoning.done":
            if (event.text) {
              logs.push(`[REASONING DONE] ${event.text}`);
              reasoningBuffer += event.text;
            }
            continue;
          case "response.reasoning_summary.delta":
            if (event.delta?.text) {
              logs.push(`[SUMMARY DELTA] ${event.delta.text}`);
              summaryBuffer += event.delta.text;
            }
            continue;
          case "response.reasoning_summary.done":
            if (event.text) {
              logs.push(`[SUMMARY DONE] ${event.text}`);
              summaryBuffer += event.text;
            }
            continue;
          default:
            logs.push(`[WARN] 未知事件类型: ${event.type}`);
            break;
        }
      }
    }

    finalize();
    logs.push(`[END] 流程正常结束`);
    return logs.join("\n");
  } catch (err: any) {
    const msg =
      err.name === "AbortError" ? "[用户中断]" : `[异常: ${err.message}]`;
    logs.push(`[EXCEPTION] ${msg}`);
    contentBuffer = appendTextChunk(contentBuffer, msg);
    finalize();
    logs.push(`[END] 流程异常结束`);
    return logs.join("\n");
  } finally {
    dispatch(removeActiveController(messageId));
    if (reader) {
      try {
        await reader.cancel();
        logs.push(`[CLEANUP] reader.cancel()`);
      } catch (__) {
        logs.push(`[CLEANUP] reader.cancel() 失败`);
      }
    }
  }
};
