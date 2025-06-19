import { prepareTools } from "ai/tools/prepareTools";
import {
  updateDialogTitle,
  updateTokens,
  addActiveController,
  removeActiveController,
} from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import { parseMultilineSSE } from "./parseMultilineSSE";
// --- 修改点：从 toolRegistry 导入 toolExecutors ---
import { toolExecutors } from "ai/tools/toolRegistry";

// 处理单次工具调用
async function processToolData(
  toolCall: any,
  thunkApi: any,
  cybotConfig: any,
  messageId: string
): Promise<any | null> {
  const func = toolCall.function;
  if (!func || !func.name) {
    return { type: "text", text: "[Tool Error] 工具调用数据无效" };
  }

  const toolName = func.name;
  let toolArgs = func.arguments;

  try {
    if (typeof toolArgs === "string") {
      if (toolArgs.trim() === "") {
        toolArgs = {};
      } else if (
        toolArgs.trim().startsWith("{") ||
        toolArgs.trim().startsWith("[")
      ) {
        try {
          toolArgs = JSON.parse(toolArgs);
        } catch (_e) {}
      }
    } else if (toolArgs === undefined || toolArgs === null) {
      toolArgs = {};
    }

    // --- 修改点：使用 toolExecutors ---
    const handler = toolExecutors[toolName];
    if (!handler) {
      return { type: "text", text: `[Tool Error] 未知工具: ${toolName}` };
    }

    // 特殊处理 run_streaming_agent
    if (toolName === "run_streaming_agent") {
      try {
        await handler(toolArgs, thunkApi);
        return null; // 返回 null，表示此工具不应产生文本反馈
      } catch (error: any) {
        return {
          type: "text",
          text: `[Tool Error] 启动 Agent 失败: ${error.message}`,
        };
      }
    }

    // 其他工具的常规处理流程
    try {
      const result = await handler(toolArgs, thunkApi);
      if (result && result.success) {
        const text =
          result.text ||
          `${toolName
            .replace(/_/g, " ")
            .replace(/^./, (c) => c.toUpperCase())} 已成功执行：${
            result.title || result.name || "操作完成"
          } (ID: ${result.id || "N/A"})`;
        return { type: "text", text };
      } else {
        return {
          type: "text",
          text: `[Tool Error] ${toolName} 操作未返回预期结果。`,
        };
      }
    } catch (error: any) {
      return {
        type: "text",
        text: `[Tool Error] 执行 ${toolName} 操作失败: ${error.message}`,
      };
    }
  } catch (e: any) {
    return {
      type: "text",
      text: `[Tool Error] 处理 ${toolName} 时发生内部错误: ${e.message}`,
    };
  }
}

// 处理多次累积的工具调用
async function handleAccumulatedToolCalls(
  accumulatedCalls: any[],
  currentContentBuffer: any[],
  thunkApi: any,
  cybotConfig: any,
  msgKey: string,
  messageId: string
): Promise<any[]> {
  let updatedContentBuffer = [...currentContentBuffer];
  const { dispatch } = thunkApi;

  if (accumulatedCalls.length > 0) {
    for (const toolCall of accumulatedCalls) {
      if (
        !toolCall.function ||
        !toolCall.function.name ||
        toolCall.function.arguments === undefined
      ) {
        continue;
      }
      try {
        const toolResult = await processToolData(
          toolCall,
          thunkApi,
          cybotConfig,
          messageId
        );

        if (toolResult) {
          // 只有当 toolResult 不为 null 时才更新消息流
          updatedContentBuffer = [...updatedContentBuffer, toolResult];
          dispatch(
            messageStreaming({
              id: messageId,
              content: updatedContentBuffer,
              role: "assistant",
              cybotKey: cybotConfig.dbKey,
            })
          );
        }
      } catch (toolError: any) {
        const errorResult = {
          type: "text",
          text: `\n[Tool 执行异常: ${toolError.message}]`,
        };
        updatedContentBuffer = [...updatedContentBuffer, errorResult];
        dispatch(
          messageStreaming({
            id: messageId,
            content: updatedContentBuffer,
            role: "assistant",
            cybotKey: cybotConfig.dbKey,
          })
        );
      }
    }
  }
  return updatedContentBuffer;
}

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
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
}) => {
  const { dispatch, getState } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());
  const { key: msgKey, messageId } = createDialogMessageKeyAndId(dialogId);

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
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: msgKey,
        content: contentBuffer,
        role: "assistant",
        cybotKey: cybotConfig.dbKey,
        isStreaming: true,
      })
    );

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
      const errorBody = await response.text();
      let errorMessage = `API请求失败: 状态码 ${response.status}`;
      let errorCode = `E${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage =
          errorJson?.error?.message ||
          errorBody ||
          `状态码 ${response.status} ${response.statusText}`;
        errorCode = errorJson?.error?.code || errorCode;
        if (response.status === 504) {
          errorMessage = "请求超时，请稍后再试";
        } else if (response.status === 401) {
          if (errorCode === "AUTH_TOKEN_EXPIRED") {
            errorMessage = "令牌已过期，请重新登录";
          } else if (errorCode === "AUTH_ACCOUNT_INVALID") {
            errorMessage = "账户无效或已被停用，请联系管理员";
          } else if (errorCode === "AUTH_NO_TOKEN") {
            errorMessage = "未提供身份验证令牌，请登录";
          } else if (errorCode === "AUTH_INVALID_TOKEN") {
            errorMessage = "无效的身份验证令牌，请重新登录";
          } else if (errorCode === "AUTH_TOKEN_NOT_ACTIVE") {
            errorMessage = "令牌尚未生效，请稍后再试";
          } else {
            errorMessage = "身份验证失败，请检查您的凭据";
          }
        } else if (response.status === 400) {
          errorMessage = "请求参数错误，请检查输入";
        }
      } catch (_e) {
        errorMessage =
          errorBody || `状态码 ${response.status} ${response.statusText}`;
      }

      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${errorMessage}]`);
      dispatch(
        messageStreaming({
          id: messageId,
          dbKey: msgKey,
          content: contentBuffer,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
          isStreaming: true,
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        contentBuffer = await handleAccumulatedToolCalls(
          accumulatedToolCalls,
          contentBuffer,
          thunkApi,
          cybotConfig,
          msgKey,
          messageId
        );
        accumulatedToolCalls = [];
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
          if (data.usage) {
            if (!totalUsage) {
              totalUsage = { ...data.usage };
            } else {
              totalUsage.completion_tokens =
                data.usage.completion_tokens ?? totalUsage.completion_tokens;
              totalUsage.prompt_tokens =
                data.usage.prompt_tokens ?? totalUsage.prompt_tokens;
              totalUsage.total_tokens =
                data.usage.total_tokens ?? totalUsage.total_tokens;
              if (data.usage.prompt_tokens_details) {
                totalUsage.prompt_tokens_details = {
                  ...(totalUsage.prompt_tokens_details || {}),
                  ...data.usage.prompt_tokens_details,
                };
              }
              if (data.usage.completion_tokens_details) {
                totalUsage.completion_tokens_details = {
                  ...(totalUsage.completion_tokens_details || {}),
                  ...data.usage.completion_tokens_details,
                };
              }
            }
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
                isStreaming: true,
              })
            );
          }

          const finishReason = choice.finish_reason;
          if (finishReason) {
            if (finishReason === "tool_calls") {
              contentBuffer = await handleAccumulatedToolCalls(
                accumulatedToolCalls,
                contentBuffer,
                thunkApi,
                cybotConfig,
                msgKey,
                messageId
              );
              accumulatedToolCalls = [];
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
                  isStreaming: true,
                })
              );
            }
          }
        }
      }
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
        isStreaming: true,
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
