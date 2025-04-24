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

import { extractCustomId } from "core/prefix";
import { createPageFunc } from "ai/tools/createPageTool"; // 确认路径
import { parseMultilineSSE } from "./parseMultilineSSE";

// --- 辅助函数：处理工具调用结果 ---
async function processToolData(
  toolCall: any,
  thunkApi: any,
  cybotConfig: any,
  messageId: string
): Promise<any> {
  // 返回消息内容部分 (IMessageContentPart)
  console.log("[Tool] 开始处理工具调用:", JSON.stringify(toolCall, null, 2));
  const func = toolCall.function;
  if (!func || !func.name) {
    // 增加对 func.name 的检查
    console.error("[Tool] 工具调用缺少函数信息或名称:", toolCall);
    return { type: "text", text: "[Tool Error] 工具调用数据无效" };
  }

  const toolName = func.name;
  let toolArgs = func.arguments;

  try {
    // 参数解析 (更健壮)
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
          // 可以选择报错或让工具处理原始字符串
          // return { type: "text", text: `[Tool Error] ${toolName} 参数 JSON 解析失败: ${toolArgs}` };
        }
      } else {
        console.warn(
          `[Tool] ${toolName}: 参数不是 JSON，将作为字符串传递: "${toolArgs}"`
        );
        // 让工具决定如何处理非 JSON 字符串参数
      }
    } else if (toolArgs === undefined || toolArgs === null) {
      toolArgs = {};
      console.warn(
        `[Tool] ${toolName}: 参数为 undefined/null，视为空对象 {}。`
      );
    }

    let resultData: any = null;
    switch (toolName) {
      case "generate_table":
        console.log("[Tool] 调用 generate_table，参数：", toolArgs);
        resultData = {
          type: "excel",
          id: toolCall.id || `tool_${Date.now()}`, // 确保有 ID
          name: toolArgs.fileName || "Excel 文件",
          data: toolArgs.data || [],
        };
        break;

      case "create_page":
        console.log("[Tool] 调用 create_page，参数：", toolArgs);
        try {
          // *** 修改: 调用 createPageFunc 并处理结果以生成 Markdown 链接 ***
          const pageResult = await createPageFunc(toolArgs, thunkApi);
          // 假设 createPageFunc 成功时返回 { success: true, id: '...', title: '...' }
          // 失败时返回 { success: false, message: '...' } 或抛出错误
          if (
            pageResult &&
            pageResult.success &&
            pageResult.id &&
            pageResult.title
          ) {
            // *** FIX 3: 构建 Markdown 链接 ***
            // !!! 重要：请将 '/app/pages/' 替换为你应用中查看页面的实际路径 !!!
            const pageUrl = `/app/pages/${pageResult.id}`;
            resultData = {
              type: "text",
              // text: `页面已成功创建：[${pageResult.title}](${pageUrl}) (页面ID: ${pageResult.id})` // 包含 ID
              text: `页面已成功创建：[${pageResult.title}](${pageUrl})`, // 仅链接
            };
            console.log(
              "[Tool] createPageFunc 成功，生成链接:",
              resultData.text
            );
          } else {
            console.error(
              "[Tool] createPageFunc 未成功或返回格式不符:",
              pageResult
            );
            resultData = {
              type: "text",
              text: `[Tool Error] create_page 操作失败: ${pageResult?.message || "未知错误"}`,
            };
          }
        } catch (error: any) {
          console.error("[Tool] createPageFunc 执行异常:", error);
          resultData = {
            type: "text",
            text: `[Tool Error] 执行 create_page 操作异常: ${error.message}`,
          };
        }
        break;

      case "generate_image":
        console.log("[Tool] 调用 generate_image，参数：", toolArgs);
        // 假设返回结构
        resultData = {
          type: "image",
          id: toolCall.id || `tool_${Date.now()}`,
          prompt: toolArgs.prompt,
          images: [], // 实际实现需要填充这个
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
  msgKey: string,
  messageId: string
): Promise<any[]> {
  let updatedContentBuffer = [...currentContentBuffer]; // 创建副本以修改
  const { dispatch } = thunkApi;

  if (accumulatedCalls.length > 0) {
    console.log("[handleAccumulatedToolCalls] 开始处理:", accumulatedCalls);
    for (const toolCall of accumulatedCalls) {
      // 增加对 function 和 arguments 的健壮性检查
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
          msgKey
        );
        updatedContentBuffer = [...updatedContentBuffer, toolResult];
        // 实时更新 UI 显示工具结果
        dispatch(
          messageStreaming({
            id: messageId,
            content: updatedContentBuffer,
            role: "assistant",
            cybotId: cybotConfig.id,
            // controller: controller // controller 在这里可能不需要传递了
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
            cybotId: cybotConfig.id,
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
  if (!textChunk) return currentContentBuffer; // 如果文本块为空，直接返回

  let updatedContentBuffer = [...currentContentBuffer]; // 创建副本

  // 防御性检查和创建新数组副本 (如果冻结)
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
    // 替换最后一个元素
    updatedContentBuffer[lastElementIndex] = updatedLastElement;
  } else {
    // 添加新的文本元素
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

  // 确保最终内容不是空的
  const finalContent =
    finalContentBuffer.length > 0
      ? finalContentBuffer
      : [{ type: "text", text: "" }];

  // *** FIX 2: 准备 usage 数据，不再附加到文本 ***
  const finalUsageData =
    totalUsage &&
    totalUsage.completion_tokens !== undefined &&
    totalUsage.completion_tokens !== null
      ? { completion_tokens: totalUsage.completion_tokens } // 只包含 completion_tokens
      : undefined; // 如果没有，则为 undefined

  console.log("[finalizeStream] 最终内容:", finalContent);
  console.log("[finalizeStream] 最终 Usage 数据:", finalUsageData);

  // 正常结束流，包含 usage 数据
  dispatch(
    messageStreamEnd({
      id: messageId,
      dbKey: msgKey,
      content: finalContent, // 不含 token 文本
      role: "assistant",
      cybotId: cybotConfig.id,
      usage: finalUsageData, // <-- 将 usage 数据添加到 payload
    })
    // !!! 提醒：确保 messageSlice.ts 中的 messageStreamEnd reducer
    // 和消息状态接口支持并存储这个可选的 `usage` 字段 !!!
  );

  // 更新 Dialog 级别的 Token 使用量
  if (totalUsage) {
    dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
  }

  // 更新对话标题 (如果内容有意义)
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
  thunkApi,
  dialogKey,
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any; // 假设是符合 Redux Thunk API 的对象 { dispatch, getState }
  dialogKey: string;
}) => {
  const { dispatch, getState } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());
  const { key, messageId } = createDialogMessageKeyAndId(dialogId);

  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
    if (!bodyData.tool_choice) {
      bodyData.tool_choice = "auto";
    }
  }

  let contentBuffer: Array<any> = []; // 使用 any[] 或更具体的类型 IMessageContentPart[]
  let reader: ReadableStreamDefaultReader | null = null;
  let totalUsage: any = null;
  let accumulatedToolCalls: any[] = [];

  try {
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: key,
        content: contentBuffer,
        role: "assistant",
        cybotId: cybotConfig.id,
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
        // 处理流结束时可能剩余的工具调用
        contentBuffer = await handleAccumulatedToolCalls(
          accumulatedToolCalls,
          contentBuffer,
          thunkApi,
          cybotConfig,
          key
        );
        accumulatedToolCalls = []; // 清空

        // 完成流处理
        finalizeStream(
          contentBuffer,
          totalUsage,
          key,
          cybotConfig,
          dialogId,
          dialogKey,
          thunkApi,
          messageId
        );
        break; // 退出 while 循环
      } // end if (done)

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        // --- 处理 Usage --- (逻辑不变)
        if (parsedData.usage) {
          if (!totalUsage) {
            totalUsage = { ...parsedData.usage };
          } else {
            /* ... 合并逻辑 ... */
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

        // --- 处理 Error ---
        if (parsedData.error) {
          const errorMsg = `Error: ${parsedData.error.message || JSON.stringify(parsedData.error)}`;
          console.error("[API Error]", errorMsg);
          contentBuffer = appendTextChunk(
            contentBuffer,
            `\n[API Error] ${errorMsg}`
          );
          // 出错时也调用 finalize，尝试保存已有内容和 token
          finalizeStream(
            contentBuffer,
            totalUsage,
            key,
            cybotConfig,
            dialogId,
            dialogKey,
            thunkApi,
            messageId
          );
          if (reader) await reader.cancel();
          return; // 提前退出
        }

        // --- 处理 Choices ---
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

        // --- 处理工具调用流 (Tool Calls Stream) ---
        if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
          for (const toolCallChunk of delta.tool_calls) {
            const index = toolCallChunk.index;
            const id = toolCallChunk.id;
            const type = toolCallChunk.type;
            const functionCall = toolCallChunk.function;

            // *** FIX 1: 处理无 index 但完整的块 ***
            if (index !== undefined && index !== null) {
              // --- 按 index 聚合 (标准) ---
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
              /* index is missing */ id !== undefined &&
              type === "function" &&
              functionCall &&
              functionCall.name &&
              functionCall.arguments !== undefined
            ) {
              // --- 处理无 index 但信息完整的块 (如 Kimi) ---
              console.warn(
                `[Tool Stream] 无 index 工具调用块，视为完整调用:`,
                toolCallChunk
              );
              // 检查重复 ID (虽然无 index 时 id 可能为空 "")
              const existingCallIndex = id
                ? accumulatedToolCalls.findIndex((call) => call.id === id)
                : -1;
              if (existingCallIndex === -1 || !id) {
                accumulatedToolCalls.push({
                  id: id, // 可能为空 ""
                  type: type,
                  function: {
                    name: functionCall.name,
                    arguments: functionCall.arguments, // 直接使用，不累加
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
              // 忽略其他不规范的块
              console.warn(
                "[Tool Stream] 工具调用块缺少 index 且数据不完整，已忽略:",
                toolCallChunk
              );
            }
          }
        }

        // --- 处理文本内容 (Content) ---
        const contentChunk = delta.content || "";
        if (contentChunk) {
          contentBuffer = appendTextChunk(contentBuffer, contentChunk);
          dispatch(
            messageStreaming({
              id: messageId,
              dbKey: key,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
              controller,
            })
          );
        }

        // --- 处理结束原因 (Finish Reason) ---
        if (finishReason) {
          console.log("[Stream] Finish Reason received:", finishReason);
          if (finishReason === "tool_calls") {
            // 收到 tool_calls 信号，处理已累积的调用
            contentBuffer = await handleAccumulatedToolCalls(
              accumulatedToolCalls,
              contentBuffer,
              thunkApi,
              cybotConfig,
              key,
              messageId
            );
            accumulatedToolCalls = []; // 清空已处理的调用
            // 注意：这里不清空 contentBuffer，因为它包含了工具调用的结果
            if (
              contentBuffer.length === currentContentBufferLengthBeforeHandling
            ) {
              // 检查是否有实际调用被处理
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
                content: contentBuffer,
                role: "assistant",
                cybotId: cybotConfig.id,
                controller,
              })
            );
          }
          // 注意：即使收到 finish_reason，循环也会继续，直到 done=true
        } // end if (finishReason)
      } // end for (const parsedData of parsedResults)
    } // end while (true)
  } catch (error: any) {
    console.error("[Chat Request] 捕获到异常:", error);
    const errorText =
      error.name === "AbortError"
        ? "\n[用户中断]"
        : `\n[错误: ${error.message || String(error)}]`;
    contentBuffer = appendTextChunk(contentBuffer, errorText); // 追加错误信息
    // 异常结束时也调用 finalize，尝试保存已有内容和 token
    finalizeStream(
      contentBuffer,
      totalUsage,
      key,
      cybotConfig,
      dialogId,
      dialogKey,
      thunkApi,
      messageId
    );
  } finally {
    // 确保 reader 被正确关闭
    if (reader) {
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        } // 确保中止
        await reader.cancel();
        console.log("[Chat Request] Reader cancelled.");
      } catch (cancelError) {
        console.warn("[Chat Request] Error cancelling reader:", cancelError);
      }
    }
    console.log("[Chat Request] Finalized.");
  }
}; // end sendCommonChatRequest
