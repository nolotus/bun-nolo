// ai/chat/sendCommonChatRequest.ts (完整替换)

import { prepareTools } from "ai/tools/prepareTools";
import {
  updateDialogTitle,
  updateTokens,
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
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import { parseMultilineSSE } from "./parseMultilineSSE";
import { parseApiError } from "./parseApiError";
import { updateTotalUsage } from "./updateTotalUsage";
import { read } from "database/dbSlice";
import { generateRequestBody } from "../cybot/generateRequestBody";
import { accumulateToolCallChunks } from "./accumulateToolCallChunks";

// 向已有内容缓冲追加新的文本片段
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

// 从 contentBuffer 中分离 <think> 标签里内容与普通内容
function separateThinkContent(contentBuffer: any[]) {
  let thinkContent = "";
  let normalContent = "";
  const combinedText = contentBuffer
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("");
  const thinkMatches = combinedText.match(/<think\b[^>]*>(.*?)<\/think>/gis);
  if (thinkMatches) {
    thinkContent = thinkMatches
      .map((m) => m.replace(/<think\b[^>]*>|<\/think>/gi, ""))
      .join("\n\n");
    normalContent = combinedText
      .replace(/<think\b[^>]*>.*?<\/think>/gis, "")
      .trim();
  } else {
    normalContent = combinedText;
  }
  return { thinkContent, normalContent };
}

// 流结束时的统一收尾
function finalizeStream(
  finalContentBuffer: any[],
  totalUsage: any,
  msgKey: string,
  cybotConfig: any,
  dialogId: string,
  dialogKey: string,
  thunkApi: any,
  messageId: string,
  reasoningBuffer: string
) {
  const { dispatch } = thunkApi;
  const { thinkContent: tagThink, normalContent } =
    separateThinkContent(finalContentBuffer);
  const thinkContent = tagThink + reasoningBuffer;
  const finalUsageData =
    totalUsage && totalUsage.completion_tokens != null
      ? { completion_tokens: totalUsage.completion_tokens }
      : undefined;
  dispatch(
    messageStreamEnd({
      id: messageId,
      dbKey: msgKey,
      content: normalContent || "",
      thinkContent,
      role: "assistant",
      cybotKey: cybotConfig.dbKey,
      usage: finalUsageData,
      isStreaming: false,
    })
  );
  if (totalUsage) {
    dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
  }
  if ((normalContent || "").trim() !== "") {
    dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
  }
}

// 辅助函数：用于启动 Agent 流并返回新的 Reader
async function initiateAgentStream(
  toolCall: any,
  thunkApi: any
): Promise<{
  newReader: ReadableStreamDefaultReader<Uint8Array>;
  newCybotConfig: any;
} | null> {
  const { getState, dispatch, signal } = thunkApi;
  const args = JSON.parse(toolCall.function.arguments);
  const { agentKey, userInput } = args;

  if (!agentKey) {
    console.error("Agent Handoff failed: missing agentKey");
    return null;
  }

  try {
    const newCybotConfig = await dispatch(read(agentKey)).unwrap();
    const bodyData = generateRequestBody(getState(), newCybotConfig, {
      currentUserContext: userInput,
    });

    const api = getApiEndpoint(newCybotConfig);
    const token = selectCurrentToken(getState());
    const currentServer = selectCurrentServer(getState());

    const response = await performFetchRequest({
      cybotConfig: newCybotConfig,
      api,
      bodyData,
      currentServer,
      signal,
      token,
    });

    if (!response.ok || !response.body) {
      const errorMsg = await parseApiError(response);
      throw new Error(`Agent [${agentKey}] request failed: ${errorMsg}`);
    }

    console.log(`Switching stream to agent: ${agentKey}`);
    return {
      newReader: response.body.getReader(),
      newCybotConfig: newCybotConfig,
    };
  } catch (error: any) {
    console.error(`Failed to initiate agent stream for [${agentKey}]:`, error);
    return null;
  }
}

// 主流程：发送常规聊天请求
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
      finalizeStream(
        contentBuffer,
        totalUsage,
        msgKey,
        cybotConfig,
        dialogId,
        dialogKey,
        thunkApi,
        messageId,
        reasoningBuffer
      );
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

          // ✨ REFACTORED PART: Use the new helper function
          if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
            accumulatedToolCalls = accumulateToolCallChunks(
              accumulatedToolCalls,
              delta.tool_calls
            );
          }

          const contentChunk = delta.content || "";
          if (contentChunk) {
            contentBuffer = appendTextChunk(contentBuffer, contentChunk);
            const { thinkContent: tagThink, normalContent } =
              separateThinkContent(contentBuffer);
            const thinkContent = tagThink + reasoningBuffer;
            dispatch(
              messageStreaming({
                id: messageId,
                dbKey: msgKey,
                content: normalContent,
                thinkContent,
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
                const handoffResult = await initiateAgentStream(
                  streamingAgentCall,
                  { ...thunkApi, signal }
                );

                if (handoffResult) {
                  await reader.cancel();
                  reader = handoffResult.newReader;
                  cybotConfig = handoffResult.newCybotConfig;
                  accumulatedToolCalls = [];
                  contentBuffer = appendTextChunk(contentBuffer, `\n\n`);
                  continue;
                } else {
                  contentBuffer = appendTextChunk(
                    contentBuffer,
                    `\n[Agent 启动失败]`
                  );
                  await reader.cancel();
                }
              } else {
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

    finalizeStream(
      contentBuffer,
      totalUsage,
      msgKey,
      cybotConfig,
      dialogId,
      dialogKey,
      thunkApi,
      messageId,
      reasoningBuffer
    );
  } catch (error: any) {
    let errorText = "";
    if (error.name === "AbortError") {
      errorText = "\n[用户中断]";
    } else {
      errorText = `\n[错误: ${error.message || String(error)}]`;
    }
    contentBuffer = appendTextChunk(contentBuffer, errorText);
    finalizeStream(
      contentBuffer,
      totalUsage,
      msgKey,
      cybotConfig,
      dialogId,
      dialogKey,
      thunkApi,
      messageId,
      reasoningBuffer
    );
  } finally {
    dispatch(removeActiveController(messageId));
    try {
      await reader?.cancel();
    } catch (_e) {}
  }
};
