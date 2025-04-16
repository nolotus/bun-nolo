// chatRequest.ts

import { prepareTools } from "ai/tools/prepareTools";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKey } from "database/keys";
import { extractCustomId } from "core/prefix";

// 解析多行 SSE 数据
function parseMultilineSSE(rawText: string) {
  const results = [];
  const lines = rawText.split("\n");
  let currentData = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("data:")) {
      const jsonStr = line.substring(5).trim();
      try {
        const parsedData = JSON.parse(jsonStr);
        results.push(parsedData);
      } catch (e) {
        // 如果直接解析失败，尝试累积数据
        currentData += jsonStr;
      }
    } else if (currentData) {
      // 如果当前行不是以 data: 开头，且有累积数据，尝试拼接解析
      currentData += line;
      try {
        const parsedData = JSON.parse(currentData);
        results.push(parsedData);
        currentData = ""; // 解析成功后清空累积数据
      } catch (e) {
        // 继续累计数据以便后续解析
      }
    }
  }
  // 处理可能残余的 currentData
  if (currentData) {
    try {
      const parsedData = JSON.parse(currentData);
      results.push(parsedData);
    } catch (e) {
      console.warn("SSE 解析结束时未能解析剩余数据:", currentData, e);
    }
  }
  return results;
}

// 处理工具调用数据，返回结构化对象而不是单一字符串
async function processToolData(
  toolCall: any,
  dispatch: any,
  cybotConfig: any,
  messageId: string
): Promise<any> {
  console.log("[Tool] 开始处理工具调用:", JSON.stringify(toolCall, null, 2));
  const func = toolCall.function;
  if (!func) {
    console.error("[Tool] 无法获取工具函数信息");
    throw new Error("无工具函数信息");
  }
  const toolName = func.name;
  let toolArgs = func.arguments;
  try {
    if (typeof toolArgs === "string") {
      try {
        toolArgs = JSON.parse(toolArgs);
      } catch (e) {
        console.warn("[Tool] 工具参数解析失败，使用原始字符串:", toolArgs);
      }
    }
    let result: any = null;
    switch (toolName) {
      case "generate_table":
        console.log("[Tool] 调用 generate_table，参数：", toolArgs);
        // 返回结构化数据，使得前端消息层可以渲染 Excel 文件
        result = {
          type: "excel",
          id: toolCall.id, // 使用 tool call 的 id
          name: toolArgs.fileName || "Excel 文件",
          data: toolArgs.data || [],
        };
        break;
      // 其他工具可以继续扩展
      default:
        console.warn("[Tool] 未知工具：", toolName);
        // 对于未知工具，可以返回一个标准的错误或提示信息结构
        result = {
          type: "text",
          text: `[Tool Error] 未知工具: ${toolName}`,
        };
        break;
    }
    console.log("[Tool] 工具调用返回结果：", JSON.stringify(result, null, 2));
    return result;
  } catch (e: any) {
    console.error("[Tool] 工具调用处理出错：", e);
    // 抛出错误或返回错误结构
    return {
      type: "text",
      text: `[Tool Error] 处理工具 ${toolName} 出错: ${e.message}`,
    };
  }
}

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
  const messageId = createDialogMessageKey(dialogId);

  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
    console.log(
      "已配置工具:",
      tools.map((t: any) => t.function.name)
    ); // Log tool names
  }

  // 使用数组保存消息内容，每个块可为文本或结构化对象（如 excel）
  let contentBuffer: Array<{ type: string; text?: string } | any> = [];
  let reader;
  let totalUsage: any = null; // 初始化为 null
  let toolCallsProcessed = false; // 标记是否已处理过工具调用块

  try {
    // 初始消息推送，确保 contentBuffer 是数组
    dispatch(
      messageStreaming({
        id: messageId,
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
      console.error("API Request Failed Body:", errorBody);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    reader = response.body?.getReader(); // Optional chaining
    if (!reader) {
      throw new Error("无法获取响应流读取器");
    }
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 确保即使流结束时 contentBuffer 为空，也发送一个包含空文本的消息
        const finalContent =
          contentBuffer.length > 0
            ? contentBuffer
            : [{ type: "text", text: "" }];
        dispatch(
          messageStreamEnd({
            id: messageId,
            content: finalContent,
            role: "assistant",
            cybotId: cybotConfig.id,
          })
        );
        console.log("Stream ended. Final totalUsage:", totalUsage);
        if (totalUsage) {
          dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
        }
        // 只有在成功完成且有内容时才更新标题
        if (contentBuffer.some((c) => c.type === "text" && c.text?.trim())) {
          dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true }); // Use stream: true for better handling
      const parsedResults = parseMultilineSSE(chunk);

      for (const parsedData of parsedResults) {
        console.log("[Debug] parsedData:", JSON.stringify(parsedData, null, 2));

        // --- 修改开始 ---
        // 优先处理 usage 数据，因为它可能出现在没有 choices 的最后一条消息中
        if (parsedData.usage) {
          console.log("[Debug] Found usage data:", parsedData.usage);
          if (!totalUsage) {
            totalUsage = { ...parsedData.usage };
          } else {
            // 使用 Math.max 确保 token 计数不会意外减少（某些模型可能在流中多次发送 usage）
            totalUsage.completion_tokens = Math.max(
              totalUsage.completion_tokens || 0,
              parsedData.usage.completion_tokens || 0
            );
            totalUsage.prompt_tokens = Math.max(
              totalUsage.prompt_tokens || 0,
              parsedData.usage.prompt_tokens || 0
            );
            totalUsage.total_tokens = Math.max(
              totalUsage.total_tokens || 0,
              parsedData.usage.total_tokens || 0
            );
            // 保留可能存在的详细信息
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
          console.log("[Debug] Updated totalUsage:", totalUsage);
        }
        // --- 修改结束 ---

        if (parsedData.error) {
          const errorMsg = `Error: ${parsedData.error.message || JSON.stringify(parsedData.error)}`;
          console.error("API Error Received:", errorMsg);
          // 附加错误信息到现有内容
          contentBuffer = [
            ...contentBuffer,
            { type: "text", text: `\n[API Error] ${errorMsg}` },
          ];
          dispatch(
            messageStreamEnd({
              id: messageId,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
            })
          );
          // 不需要再抛出错误，因为已经通过 Redux 更新了状态
          // throw new Error(errorMsg); // Consider removing this throw if handled by streamEnd
          return; // 结束处理循环
        }

        const choice = parsedData.choices?.[0];
        // 如果没有 choice 但有 usage，我们已经在上面处理了，所以这里可以安全跳过
        // 但如果连 usage 都没有，那这条消息可能是 ping 或其他元数据，跳过
        if (!choice && !parsedData.usage) continue;
        // 如果有 choice，继续处理 delta
        if (!choice) continue; // 如果 choice 明确不存在，则跳过后续处理

        const delta = choice.delta || {};

        // 检查并处理工具调用数据
        if (
          delta.tool_calls &&
          Array.isArray(delta.tool_calls) &&
          delta.tool_calls.length > 0
        ) {
          console.log(
            "检测到工具调用，工具数据:",
            JSON.stringify(delta.tool_calls, null, 2)
          );
          // 确保只处理一次工具调用块，避免重复处理累积的 tool_calls
          if (!toolCallsProcessed) {
            for (const toolCall of delta.tool_calls) {
              if (!toolCall.function) continue; // 跳过不完整的工具调用块
              try {
                const toolResult = await processToolData(
                  toolCall,
                  dispatch,
                  cybotConfig,
                  messageId
                );
                // toolResult 现在保证是一个对象 { type: 'excel' | 'text', ... }
                let newContentBuffer = [...contentBuffer, toolResult]; // 直接添加返回的对象
                contentBuffer = newContentBuffer;

                dispatch(
                  messageStreaming({
                    id: messageId,
                    content: contentBuffer,
                    role: "assistant",
                    cybotId: cybotConfig.id,
                    controller,
                  })
                );
              } catch (toolError: any) {
                // catch 应该不会触发，因为 processToolData 内部处理了
                console.error("工具调用处理失败 (外层捕获):", toolError);
                const newContentBuffer = [
                  ...contentBuffer,
                  {
                    type: "text",
                    text: "\n[Tool 执行异常: " + toolError.message + "]",
                  },
                ];
                contentBuffer = newContentBuffer;
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
            }
            // 标记已经处理过这个流中的工具调用部分
            if (delta.tool_calls.some((tc: any) => tc.function?.name)) {
              // 确保是真的工具调用才标记
              toolCallsProcessed = true;
            }
          }
          // 如果完成原因是 tool_calls，表示模型期望我们响应工具结果
          if (choice.finish_reason === "tool_calls") {
            console.log("接收到工具调用结束标识 (finish_reason: tool_calls)。");
            // 这里可以根据需要决定是否继续等待模型的进一步响应，或者基于工具结果发起新的请求
            // 当前实现是继续监听流，看模型是否在工具调用后还有最终文本输出
            continue; // 继续循环以处理可能的后续消息或结束信号
          }
        }

        // 处理正常文本内容
        const content = delta.content || "";
        if (content) {
          // 检查 contentBuffer 是否是只读的（不应该发生，但作为安全检查）
          if (Object.isFrozen(contentBuffer)) {
            console.warn("contentBuffer is frozen, creating a new array.");
            contentBuffer = [...contentBuffer]; // 解冻
          }

          let newContentBuffer;
          // 优化：如果最后一个元素是文本，直接追加；否则添加新文本块
          if (
            contentBuffer.length > 0 &&
            contentBuffer[contentBuffer.length - 1].type === "text"
          ) {
            // 创建新对象来更新 text，而不是直接修改原对象
            const lastElement = contentBuffer[contentBuffer.length - 1];
            newContentBuffer = [
              ...contentBuffer.slice(0, contentBuffer.length - 1),
              { ...lastElement, text: (lastElement.text || "") + content },
            ];
          } else {
            newContentBuffer = [
              ...contentBuffer,
              { type: "text", text: content },
            ];
          }
          contentBuffer = newContentBuffer;
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
      }
    }
  } catch (error: any) {
    console.error("请求或处理流时发生错误:", error);
    const errorText =
      error.name === "AbortError"
        ? "\n[用户中断]"
        : `\n[错误: ${error.message}]`;

    // 确保 contentBuffer 可写
    if (Object.isFrozen(contentBuffer)) {
      contentBuffer = [...contentBuffer];
    }

    // 附加错误信息
    let newContentBuffer;
    if (
      contentBuffer.length > 0 &&
      contentBuffer[contentBuffer.length - 1].type === "text"
    ) {
      const lastElement = contentBuffer[contentBuffer.length - 1];
      newContentBuffer = [
        ...contentBuffer.slice(0, contentBuffer.length - 1),
        { ...lastElement, text: (lastElement.text || "") + errorText },
      ];
    } else {
      newContentBuffer = [...contentBuffer, { type: "text", text: errorText }];
    }
    contentBuffer = newContentBuffer;

    // 发送最终包含错误信息的消息结束状态
    dispatch(
      messageStreamEnd({
        id: messageId,
        content: contentBuffer, // 发送包含错误信息的最终内容
        role: "assistant",
        cybotId: cybotConfig.id,
      })
    );
    // 对于非 AbortError，仍然建议向上抛出，以便调用者知道发生了未处理的错误
    if (error.name !== "AbortError") {
      // 可以考虑在这里包装错误或记录更详细的信息
      // throw error; // 根据你的错误处理策略决定是否重新抛出
    }
  } finally {
    if (reader) {
      reader.releaseLock();
    }
    // 可以在这里添加额外的清理逻辑
  }
};
