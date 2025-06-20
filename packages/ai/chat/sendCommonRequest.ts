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
import { initiateAgentStream } from "../cybot/cybotSlice"; // ✨ 1. 从 cybotSlice 导入 action

// 辅助函数：向已有内容缓冲追加新的文本片段 (无变化)
function appendTextChunk(
  currentContentBuffer: any[],
  textChunk: string
): any[] {
  if (!textChunk) return currentContentBuffer;
  let updatedContentBuffer = [...currentContentBuffer];
  const lastIndex = updatedContentBuffer.length - 1;
  if (lastIndex >= 0 && updatedContentBuffer[lastIndex].type === "text") {
    const last = updatedContentBuffer[lastIndex];
    updatedContentBuffer[lastIndex] = {
      ...last,
      text: (last.text || "") + textChunk,
    };
  } else {
    updatedContentBuffer.push({ type: "text", text: textChunk });
  }
  return updatedContentBuffer;
}

// 主流程：发送常规聊天请求
export const sendCommonChatRequest = async ({
  bodyData,
  cybotConfig,
  thunkApi,
  dialogKey,
  parentMessageId,
  inheritedContext, // 接收从 streamCybotId 传递过来的完整上下文
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
  parentMessageId?: string;
  inheritedContext?: any; // 定义类型
}) => {
  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());
  const signal = controller.signal;

  let messageId: string;
  let msgKey: string;

  if (parentMessageId) {
    messageId = parentMessageId;
    msgKey = `msg:${dialogId}:${messageId}`;
  } else {
    const newIds = createDialogMessageKeyAndId(dialogId);
    messageId = newIds.messageId;
    msgKey = newIds.key;
  }

  dispatch(addActiveController({ messageId, controller }));

  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
    if (!bodyData.tool_choice) {
      bodyData.tool_choice = "auto";
    }
  }

  let contentBuffer: any[] = [];
  let totalUsage: any = null;
  let accumulatedToolCalls: any[] = [];
  let reasoningBuffer: string = "";
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  const finalize = () => {
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
    if (!parentMessageId) {
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
    }

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
      const errorMessage = await parseApiError(response);
      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${errorMessage}]`);
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
        if (accumulatedToolCalls.length > 0) {
          const result = await dispatch(
            handleToolCalls({
              accumulatedCalls: accumulatedToolCalls,
              currentContentBuffer: contentBuffer,
              cybotConfig,
              messageId,
            })
          ).unwrap();
          contentBuffer = result.finalContentBuffer;
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        const dataList = Array.isArray(parsedData) ? parsedData : [parsedData];
        for (const data of dataList) {
          if (data.usage) {
            totalUsage = updateTotalUsage(totalUsage, data.usage);
          }

          if (data.error) {
            const errorMsg = `Error: ${data.error.message || JSON.stringify(data.error)}`;
            contentBuffer = appendTextChunk(
              contentBuffer,
              `\n[API Error] ${errorMsg}`
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

          if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
            accumulatedToolCalls = accumulateToolCallChunks(
              accumulatedToolCalls,
              delta.tool_calls
            );
          }

          const contentChunk = delta.content || "";
          if (contentChunk) {
            contentBuffer = appendTextChunk(contentBuffer, contentChunk);
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

          const finishReason = choice.finish_reason;
          if (finishReason) {
            if (finishReason === "tool_calls") {
              const streamingAgentCall = accumulatedToolCalls.find(
                (call) => call.function?.name === "run_streaming_agent"
              );

              if (streamingAgentCall) {
                // ✨ 2. 通过 dispatch 调用新的 Thunk action
                const args = JSON.parse(streamingAgentCall.function.arguments);

                try {
                  // .unwrap() 会在 thunk 失败时自动抛出错误，成功时返回 payload
                  const handoffResult = await dispatch(
                    initiateAgentStream({
                      agentKey: args.agentKey,
                      userInput: args.userInput,
                      inheritedContext: inheritedContext, // 传递继承的上下文
                    })
                  ).unwrap();

                  // ✨ 3. handoffResult 现在是 Thunk 的返回值
                  if (handoffResult) {
                    await reader.cancel();
                    reader = handoffResult.newReader;
                    cybotConfig = handoffResult.newCybotConfig;
                    accumulatedToolCalls = [];
                    contentBuffer = appendTextChunk(contentBuffer, `\n\n`);
                    continue; // 继续外层 while 循环，使用新的 reader
                  }
                } catch (error: any) {
                  // 如果 initiateAgentStream thunk 失败
                  console.error("Agent handoff failed:", error);
                  const errorMessage = error.message || String(error);
                  contentBuffer = appendTextChunk(
                    contentBuffer,
                    `\n[Agent 启动失败: ${errorMessage}]`
                  );
                  await reader.cancel();
                }
              } else {
                // 处理非流式的 tool calls
                const result = await dispatch(
                  handleToolCalls({
                    accumulatedCalls: accumulatedToolCalls,
                    currentContentBuffer: contentBuffer,
                    cybotConfig,
                    messageId,
                  })
                ).unwrap();
                contentBuffer = result.finalContentBuffer;
                accumulatedToolCalls = [];
              }
            } else {
              if (finishReason !== "stop") {
                contentBuffer = appendTextChunk(
                  contentBuffer,
                  `\n[流结束原因: ${finishReason}]`
                );
              }
            }
          }
        }
      }
    }

    finalize();
  } catch (error: any) {
    let errorText = "";
    if (error.name === "AbortError") {
      errorText = "\n[用户中断]";
    } else {
      errorText = `\n[错误: ${error.message || String(error)}]`;
    }
    contentBuffer = appendTextChunk(contentBuffer, errorText);
    finalize();
  } finally {
    dispatch(removeActiveController(messageId));
    try {
      await reader?.cancel();
    } catch (_e) {}
  }
};
