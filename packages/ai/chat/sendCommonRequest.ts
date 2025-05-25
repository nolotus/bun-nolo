// 文件路径: ai/chat/sendCommonChatRequest.ts

import { prepareTools } from "ai/tools/prepareTools";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";

import { extractCustomId } from "core/prefix";

import { parseMultilineSSE } from "./parseMultilineSSE";
import { toolHandlers } from "../tools/toolHandlers";

// --- 辅助函数：处理工具调用结果 ---

async function processToolData(
  toolCall: any,
  thunkApi: any,
  cybotConfig: any,
  messageId: string
): Promise<any> {
  console.log("[Tool] 开始处理工具调用:", JSON.stringify(toolCall, null, 2));
  const func = toolCall.function;
  if (!func || !func.name) {
    console.error("[Tool] 工具调用缺少函数信息或名称:", toolCall);
    return { type: "text", text: "[Tool Error] 工具调用数据无效" };
  }

  const toolName = func.name;
  let toolArgs = func.arguments;

  try {
    // 参数解析逻辑（保持不变）
    if (typeof toolArgs === "string") {
      if (toolArgs.trim() === "") {
        toolArgs = {};
        console.warn(`[Tool] ${toolName}: 参数为空字符串，视为空对象 {}。`);
      } else if (
        toolArgs.trim().startsWith("{") ||
        toolArgs.trim().startsWith("[")
      ) {
        try {
          toolArgs = JSON.parse(toolArgs);
        } catch (e) {
          console.warn(
            `[Tool] ${toolName}: JSON 参数解析失败，将使用原始字符串: "${toolArgs}"`,
            e
          );
        }
      } else {
        console.warn(
          `[Tool] ${toolName}: 参数不是 JSON，将作为字符串传递: "${toolArgs}"`
        );
      }
    } else if (toolArgs === undefined || toolArgs === null) {
      toolArgs = {};
      console.warn(
        `[Tool] ${toolName}: 参数为 undefined/null，视为空对象 {}。`
      );
    }

    const handler = toolHandlers[toolName];
    if (!handler) {
      console.warn("[Tool] 未知工具：", toolName);
      return { type: "text", text: `[Tool Error] 未知工具: ${toolName}` };
    }

    console.log(`[Tool] 调用 ${toolName}，参数：`, toolArgs);
    try {
      const result = await handler(toolArgs, thunkApi);
      if (result && result.success) {
        // 如果 result 中有自定义 text 字段，优先使用
        const text =
          result.text ||
          `${toolName.replace("_", " ").replace(/^./, (c) => c.toUpperCase())} 已成功执行：${result.title || result.name || "操作完成"} (ID: ${result.id || "N/A"})`;
        console.log(`[Tool] ${toolName} 成功，生成信息:`, text);
        return { type: "text", text };
      } else {
        console.error(`[Tool] ${toolName} 未返回预期的成功结构:`, result);
        return {
          type: "text",
          text: `[Tool Error] ${toolName} 操作未返回预期结果。`,
        };
      }
    } catch (error: any) {
      console.error(`[Tool] ${toolName} 执行异常:`, error);
      return {
        type: "text",
        text: `[Tool Error] 执行 ${toolName} 操作失败: ${error.message}`,
      };
    }
  } catch (e: any) {
    console.error(`[Tool] ${toolName} 处理过程中发生意外错误:`, e);
    return {
      type: "text",
      text: `[Tool Error] 处理 ${toolName} 时发生内部错误: ${e.message}`,
    };
  }
}

// --- 辅助函数：处理累积的工具调用 ---
async function handleAccumulatedToolCalls(
  accumulatedCalls: any[],
  currentContentBuffer: any[],
  thunkApi: any,
  cybotConfig: any,
  msgKey: string, // 这个是消息的 key
  messageId: string // 这个是消息的 UI id
): Promise<any[]> {
  let updatedContentBuffer = [...currentContentBuffer]; // 创建副本以修改
  const { dispatch } = thunkApi;

  if (accumulatedCalls.length > 0) {
    console.log("[handleAccumulatedToolCalls] 开始处理:", accumulatedCalls);
    for (const toolCall of accumulatedCalls) {
      if (
        !toolCall.function ||
        !toolCall.function.name ||
        toolCall.function.arguments === undefined
      ) {
        console.warn(
          "[handleAccumulatedToolCalls] 跳过不完整的工具调用:",
          toolCall
        );
        continue;
      }
      try {
        const toolResult = await processToolData(
          toolCall,
          thunkApi,
          cybotConfig,
          messageId
        );
        updatedContentBuffer = [...updatedContentBuffer, toolResult];
        dispatch(
          messageStreaming({
            id: messageId,
            content: updatedContentBuffer,
            role: "assistant",
            cybotKey: cybotConfig.dbKey,
          })
        );
      } catch (toolError: any) {
        console.error(
          "[handleAccumulatedToolCalls] processToolData 异常:",
          toolError
        );
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
    console.log("[handleAccumulatedToolCalls] 处理完成.");
  }
  return updatedContentBuffer; // 返回更新后的 buffer
}

// --- 辅助函数：追加文本块 ---
function appendTextChunk(
  currentContentBuffer: any[],
  textChunk: string
): any[] {
  if (!textChunk) return currentContentBuffer;

  let updatedContentBuffer = [...currentContentBuffer];

  if (Object.isFrozen(updatedContentBuffer)) {
    console.warn(
      "Content buffer is frozen, creating a new array for appending text."
    );
    updatedContentBuffer = [...updatedContentBuffer];
  }

  const lastElementIndex = updatedContentBuffer.length - 1;
  if (
    lastElementIndex >= 0 &&
    updatedContentBuffer[lastElementIndex].type === "text"
  ) {
    const lastElement = updatedContentBuffer[lastElementIndex];
    const updatedLastElement = {
      ...lastElement,
      text: (lastElement.text || "") + textChunk,
    };
    updatedContentBuffer[lastElementIndex] = updatedLastElement;
  } else {
    updatedContentBuffer.push({ type: "text", text: textChunk });
  }
  return updatedContentBuffer;
}

// --- 辅助函数：完成流处理 ---
function finalizeStream(
  finalContentBuffer: any[],
  totalUsage: any,
  msgKey: string,
  cybotConfig: any,
  dialogId: string,
  dialogKey: string,
  thunkApi: any,
  messageId: string
) {
  const { dispatch } = thunkApi;

  const finalContent =
    finalContentBuffer.length > 0
      ? finalContentBuffer
      : [{ type: "text", text: "" }];

  const finalUsageData =
    totalUsage &&
    totalUsage.completion_tokens !== undefined &&
    totalUsage.completion_tokens !== null
      ? { completion_tokens: totalUsage.completion_tokens }
      : undefined;
  console.log("cybotConfig", cybotConfig);
  dispatch(
    messageStreamEnd({
      id: messageId,
      dbKey: msgKey,
      content: finalContent,
      role: "assistant",
      cybotKey: cybotConfig.dbKey,
      usage: finalUsageData,
    })
  );

  if (totalUsage) {
    dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
  }

  const hasMeaningfulText = finalContent.some(
    (c) => c.type === "text" && c.text?.trim()
  );
  if (hasMeaningfulText) {
    dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
  }

  console.log("[finalizeStream] 流处理完成.");
}

// --- 主要请求函数 ---
export const sendCommonChatRequest = async ({
  bodyData,
  cybotConfig,
  thunkApi, // 确保传入的是 { dispatch, getState }
  dialogKey,
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
}) => {
  const { dispatch, getState } = thunkApi; // 解构以备后用
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());
  const { key: msgKey, messageId } = createDialogMessageKeyAndId(dialogId);

  // --- (工具准备逻辑不变) ---
  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
    if (!bodyData.tool_choice) {
      bodyData.tool_choice = "auto";
    }
  }

  let contentBuffer: Array<any> = [];
  let reader: ReadableStreamDefaultReader | null = null;
  let totalUsage: any = null;
  let accumulatedToolCalls: any[] = [];

  try {
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: msgKey,
        content: contentBuffer,
        role: "assistant",
        cybotKey: cybotConfig.dbKey,
        controller,
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
        // 根据状态码和错误代码自定义错误提示
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
      } catch (e) {
        console.error("[Chat Request] 解析错误响应失败:", e);
        errorMessage =
          errorBody || `状态码 ${response.status} ${response.statusText}`;
      }
      console.error("[Chat Request] API请求失败:", errorMessage);

      // 将错误信息以流式传输方式显示
      contentBuffer = appendTextChunk(contentBuffer, `[错误: ${errorMessage}]`);
      dispatch(
        messageStreaming({
          id: messageId,
          dbKey: msgKey,
          content: contentBuffer,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
          controller,
        })
      );

      // 结束流处理
      finalizeStream(
        contentBuffer,
        totalUsage,
        msgKey,
        cybotConfig,
        dialogId,
        dialogKey,
        thunkApi,
        messageId
      );
      return; // 提前返回，避免继续处理流
    }

    // 以下代码保持不变，继续处理流式响应
    reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法获取响应流读取器");
    }
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("[Stream] 流结束 (done=true).");
        const currentContentBufferLengthBeforeHandling = contentBuffer.length;
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
          messageId
        );
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        // --- (Usage 处理逻辑不变) ---
        if (parsedData.usage) {
          if (!totalUsage) {
            totalUsage = { ...parsedData.usage };
          } else {
            totalUsage.completion_tokens =
              parsedData.usage.completion_tokens ??
              totalUsage.completion_tokens;
            totalUsage.prompt_tokens =
              parsedData.usage.prompt_tokens ?? totalUsage.prompt_tokens;
            totalUsage.total_tokens =
              parsedData.usage.total_tokens ?? totalUsage.total_tokens;
            if (parsedData.usage.prompt_tokens_details) {
              totalUsage.prompt_tokens_details = {
                ...(totalUsage.prompt_tokens_details || {}),
                ...parsedData.usage.prompt_tokens_details,
              };
            }
            if (parsedData.usage.completion_tokens_details) {
              totalUsage.completion_tokens_details = {
                ...(totalUsage.completion_tokens_details || {}),
                ...parsedData.usage.completion_tokens_details,
              };
            }
          }
        }

        // --- (Error 处理逻辑不变) ---
        if (parsedData.error) {
          const errorMsg = `Error: ${parsedData.error.message || JSON.stringify(parsedData.error)}`;
          console.error("[API Error]", errorMsg);
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
            messageId
          );
          if (reader) await reader.cancel();
          return;
        }

        // --- (Choices 处理逻辑不变) ---
        const choice = parsedData.choices?.[0];
        if (
          !choice &&
          (parsedData.usage ||
            Object.keys(parsedData).length > 1 ||
            parsedData.id)
        )
          continue;
        if (!choice && Object.keys(parsedData).length === 0) continue;
        if (!choice) {
          console.warn(
            "SSE chunk without choices or known metadata:",
            parsedData
          );
          continue;
        }

        const delta = choice.delta || {};
        const finishReason = choice.finish_reason;

        // --- (Tool Calls Stream 处理逻辑不变) ---
        if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
          for (const toolCallChunk of delta.tool_calls) {
            const index = toolCallChunk.index;
            const id = toolCallChunk.id;
            const type = toolCallChunk.type;
            const functionCall = toolCallChunk.function;

            if (index !== undefined && index !== null) {
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
              id !== undefined &&
              type === "function" &&
              functionCall &&
              functionCall.name &&
              functionCall.arguments !== undefined
            ) {
              console.warn(
                `[Tool Stream] 无 index 工具调用块，视为完整调用:`,
                toolCallChunk
              );
              const existingCallIndex = id
                ? accumulatedToolCalls.findIndex((call) => call.id === id)
                : -1;
              if (existingCallIndex === -1 || !id) {
                accumulatedToolCalls.push({
                  id: id,
                  type: type,
                  function: {
                    name: functionCall.name,
                    arguments: functionCall.arguments,
                  },
                });
                console.log(
                  `[Tool Stream] 添加了无 index 的完整工具调用 (ID: ${id || "N/A"}).`
                );
              } else {
                console.warn(
                  `[Tool Stream] 发现重复 ID (${id}) 的无 index 工具调用块，已忽略:`,
                  toolCallChunk
                );
              }
            } else {
              console.warn(
                "[Tool Stream] 工具调用块缺少 index 且数据不完整，已忽略:",
                toolCallChunk
              );
            }
          }
        }

        // --- (Content 处理逻辑不变) ---
        const contentChunk = delta.content || "";
        if (contentChunk) {
          contentBuffer = appendTextChunk(contentBuffer, contentChunk);
          dispatch(
            messageStreaming({
              id: messageId,
              dbKey: msgKey,
              content: contentBuffer,
              role: "assistant",
              cybotKey: cybotConfig.dbKey,
              controller,
            })
          );
        }

        // --- (Finish Reason 处理逻辑不变) ---
        if (finishReason) {
          console.log("[Stream] Finish Reason received:", finishReason);
          if (finishReason === "tool_calls") {
            const currentContentBufferLengthBeforeHandling =
              contentBuffer.length;
            contentBuffer = await handleAccumulatedToolCalls(
              accumulatedToolCalls,
              contentBuffer,
              thunkApi,
              cybotConfig,
              msgKey,
              messageId
            );
            accumulatedToolCalls = [];
            if (
              contentBuffer.length === currentContentBufferLengthBeforeHandling
            ) {
              console.warn(
                "[Finish Reason=tool_calls] 收到 tool_calls，但处理后无有效工具调用结果。"
              );
            }
          } else if (finishReason === "stop") {
            console.log("[Finish Reason=stop] 流正常结束信号.");
          } else {
            console.warn("[Stream] 其他 Finish Reason:", finishReason);
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
                controller,
              })
            );
          }
        }
      } // end for parsedData
    } // end while
  } catch (error: any) {
    console.error("[Chat Request] 捕获到异常:", error);
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
        controller,
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
      messageId
    );
  } finally {
    // --- (Reader 关闭逻辑不变) ---
    if (reader) {
      try {
        if (!controller.signal.aborted) {
          // controller.abort(); // May not be needed if cancel() aborts internally
        }
        await reader.cancel();
        console.log("[Chat Request] Reader cancelled.");
      } catch (cancelError) {
        console.warn("[Chat Request] Error cancelling reader:", cancelError);
      }
    }
    console.log("[Chat Request] Finalized.");
  }
}; // end sendCommonChatRequest
