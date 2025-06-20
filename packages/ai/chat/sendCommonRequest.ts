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
  const { dispatch, getState } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());

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
      currentServer,
      signal,
      token,
    });

    if (!response.ok) {
      const errorMessage = await parseApiError(response);
      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${errorMessage}]`);
      dispatch(
        messageStreaming({
          id: messageId,
          dbKey: msgKey,
          content: contentBuffer,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
        })
      );
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

    reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法获取响应流读取器");
    }
    const decoder = new TextDecoder();

    let agentTookOverInLoop = false;

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
          if (result.agentTookOver) {
            return;
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
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        const dataList = Array.isArray(parsedData) ? parsedData : [parsedData];

        for (const data of dataList) {
          // ✨ 重构点：使用新的辅助函数处理 usage 数据的累积
          if (data.usage) {
            totalUsage = updateTotalUsage(totalUsage, data.usage);
          }

          if (data.error) {
            const errorMsg = `Error: ${data.error.message || JSON.stringify(data.error)}`;
            contentBuffer = appendTextChunk(
              contentBuffer,
              `\n[API Error] ${errorMsg}`
            );
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
            await reader.cancel();
            return;
          }

          const choice = data.choices?.[0];
          if (!choice) continue;
          const delta = choice.delta || {};

          if (delta.reasoning_content) {
            reasoningBuffer += delta.reasoning_content;
          }

          if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
            for (const toolCallChunk of delta.tool_calls) {
              const index = toolCallChunk.index;
              const id = toolCallChunk.id;
              const type = toolCallChunk.type;
              const functionCall = toolCallChunk.function;

              if (index != null) {
                while (accumulatedToolCalls.length <= index) {
                  accumulatedToolCalls.push({});
                }
                const currentTool = accumulatedToolCalls[index];
                if (id && !currentTool.id) currentTool.id = id;
                if (type && !currentTool.type) currentTool.type = type;
                if (functionCall) {
                  if (!currentTool.function)
                    currentTool.function = { name: "", arguments: "" };
                  if (functionCall.name)
                    currentTool.function.name += functionCall.name;
                  if (functionCall.arguments)
                    currentTool.function.arguments =
                      (currentTool.function.arguments || "") +
                      functionCall.arguments;
                }
              } else if (
                id != null &&
                type === "function" &&
                functionCall?.name &&
                functionCall.arguments != null
              ) {
                const existingIndex = id
                  ? accumulatedToolCalls.findIndex((c) => c.id === id)
                  : -1;
                if (existingIndex === -1 || !id) {
                  accumulatedToolCalls.push({
                    id,
                    type,
                    function: {
                      name: functionCall.name,
                      arguments: functionCall.arguments,
                    },
                  });
                }
              }
            }
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

              if (result.agentTookOver) {
                agentTookOverInLoop = true;
                break;
              }
            } else if (finishReason === "stop") {
              // Standard stop, do nothing special
            } else {
              contentBuffer = appendTextChunk(
                contentBuffer,
                `\n[流结束原因: ${finishReason}]`
              );
              dispatch(
                messageStreaming({
                  id: messageId,
                  dbKey: msgKey,
                  content: contentBuffer,
                  role: "assistant",
                  cybotKey: cybotConfig.dbKey,
                })
              );
            }
          }
        }
      }

      if (agentTookOverInLoop) {
        break;
      }
    }

    if (agentTookOverInLoop) {
      return;
    }
  } catch (error: any) {
    let errorText = "";
    if (error.name === "AbortError") {
      errorText = "\n[用户中断]";
    } else if (
      error.message.includes("网络请求失败") ||
      error.message.includes("NetworkError")
    ) {
      errorText = "\n[错误: 网络连接失败，请检查您的网络设置]";
    } else {
      errorText = `\n[错误: ${error.message || String(error)}]`;
    }
    contentBuffer = appendTextChunk(contentBuffer, errorText);
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: msgKey,
        content: contentBuffer,
        role: "assistant",
        cybotKey: cybotConfig.dbKey,
      })
    );
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
