// 文件路径: chatRequest.ts

import { prepareTools } from "ai/tools/prepareTools";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
// *** 修改: 引入 Action 类型和 Slice 类型，如果使用 TypeScript ***
// import { AppThunk, RootState } from 'path/to/your/store'; // 假设有类型定义
// import { IMessageContentPart } from 'path/to/your/message/types'; // 假设有类型定义
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";

import { extractCustomId } from "core/prefix";
import { createPageFunc } from "ai/tools/createPageTool"; // 确认路径
import { parseMultilineSSE } from "./parseMultilineSSE";
// *** 修改: 引入 generateTable 函数 ***
import { generateTable } from "ai/tools/generateTableTool"; // 确认路径

// --- 辅助函数：处理工具调用结果 ---
async function processToolData(
  toolCall: any,
  thunkApi: any, // { dispatch, getState }
  cybotConfig: any,
  messageId: string // 或 msgKey
): Promise<any> {
  // Returns IMessageContentPart
  console.log("[Tool] 开始处理工具调用:", JSON.stringify(toolCall, null, 2));
  const func = toolCall.function;
  if (!func || !func.name) {
    console.error("[Tool] 工具调用缺少函数信息或名称:", toolCall);
    return { type: "text", text: "[Tool Error] 工具调用数据无效" };
  }

  const toolName = func.name;
  let toolArgs = func.arguments;

  // *** 修改: 从 thunkApi 获取 getState 和 dispatch ***
  const { getState, dispatch } = thunkApi;

  try {
    // ... (参数解析逻辑保持不变) ...
    if (typeof toolArgs === "string") {
      // ...(robust argument parsing)...
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

    let resultData: any = null; // Should be IMessageContentPart
    switch (toolName) {
      case "generate_table":
        console.log("[Tool] 调用 generate_table，参数：", toolArgs);
        try {
          // *** 修改: 调用实际的 generateTable 函数 ***
          // 假设你有方法从 state 获取 currentUserId
          const currentUserId = selectCurrentUserId(getState());
          // generateTable 现在会直接触发下载并返回一个消息字符串
          const resultMessage = await generateTable(
            toolArgs,
            thunkApi,
            currentUserId
          );
          console.log("[Tool] generateTable 成功:", resultMessage);
          // *** 修改: 将函数的返回消息作为文本内容显示 ***
          resultData = {
            type: "text",
            text: resultMessage, // 使用 generateTable 返回的成功消息
          };
        } catch (error: any) {
          // 捕获 generateTable 抛出的错误
          console.error("[Tool] generateTable 执行异常:", error);
          resultData = {
            type: "text",
            // *** 修改: 显示来自 generateTable 的具体错误消息 ***
            text: `[Tool Error] 执行 generate_table 操作失败: ${error.message}`,
          };
        }
        break;

      case "create_page":
        console.log("[Tool] 调用 create_page，参数：", toolArgs);
        try {
          const pageResult = await createPageFunc(toolArgs, thunkApi);
          if (
            pageResult &&
            pageResult.success &&
            pageResult.id &&
            pageResult.title
          ) {
            const pageUrl = `${pageResult.id}`;
            console.log("pageUrl:", pageUrl);
            const text = `页面已成功创建：[${pageResult.title}](${pageUrl})`;
            console.log("[Tool] createPageFunc 成功，生成链接:", text);
            resultData = { type: "text", text: text };
            console.log(
              "[Tool] createPageFunc 成功，生成链接:",
              resultData.text
            );
          } else {
            console.error(
              "[Tool] createPageFunc 未返回预期的成功结构:",
              pageResult
            );
            resultData = {
              type: "text",
              text: `[Tool Error] create_page 操作未返回预期结果。`,
            };
          }
        } catch (error: any) {
          console.error("[Tool] createPageFunc 执行异常:", error);
          resultData = {
            type: "text",
            text: `[Tool Error] 执行 create_page 操作失败: ${error.message}`,
          };
        }
        break;

      case "generate_image":
        console.log("[Tool] 调用 generate_image，参数：", toolArgs);
        // TODO: 这里可能也需要调用实际的图像生成函数
        resultData = {
          type: "image",
          id: toolCall.id || `tool_${Date.now()}`,
          prompt: toolArgs.prompt,
          images: [], // Placeholder - 需要实际的图像生成逻辑填充
        };
        break;

      default:
        console.warn("[Tool] 未知工具：", toolName);
        resultData = {
          type: "text",
          text: `[Tool Error] 未知工具: ${toolName}`,
        };
        break;
    }
    console.log("[Tool] 返回处理结果:", JSON.stringify(resultData, null, 2));
    return resultData;
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
        // *** 调用更新后的 processToolData ***
        const toolResult = await processToolData(
          toolCall,
          thunkApi, // 传递 thunkApi 给 processToolData
          cybotConfig,
          messageId // 传递 messageId 或 msgKey
        );
        // *** toolResult 现在是 { type: 'text', text: '...' } 格式 ***
        updatedContentBuffer = [...updatedContentBuffer, toolResult];
        // 实时更新 UI 显示工具结果
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

// --- 辅助函数：追加文本块 --- (代码无变化)
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

// --- 辅助函数：完成流处理 --- (代码无变化)
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

// --- 主要请求函数 --- (大部分无变化，确保 thunkApi 正确传递)
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
    // *** 假设 generateTableTool 包含在 cybotConfig.tools 列表中 ***
    // prepareTools 应该能处理来自 ai/tools/generateTableTool.ts 的定义
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
    const response = await performFetchRequest(
      cybotConfig,
      api,
      bodyData,
      currentServer,
      signal
    );

    if (!response.ok) {
      const errorBody = await response.text();
      let errorJson = null;
      try {
        errorJson = JSON.parse(errorBody);
      } catch (e) {}
      const errorMessage =
        errorJson?.error?.message ||
        errorBody ||
        `${response.status} ${response.statusText}`;
      throw new Error(`API请求失败: ${errorMessage}`);
    }

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
          thunkApi, // *** 传递 thunkApi ***
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
          thunkApi, // *** 传递 thunkApi ***
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
            thunkApi, // *** 传递 thunkApi ***
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
              thunkApi, // *** 传递 thunkApi ***
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
    const errorText =
      error.name === "AbortError"
        ? "\n[用户中断]"
        : `\n[错误: ${error.message || String(error)}]`;
    contentBuffer = appendTextChunk(contentBuffer, errorText);
    finalizeStream(
      contentBuffer,
      totalUsage,
      msgKey,
      cybotConfig,
      dialogId,
      dialogKey,
      thunkApi, // *** 传递 thunkApi ***
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
