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
        currentData += jsonStr;
      }
    } else if (currentData) {
      currentData += line;
      try {
        const parsedData = JSON.parse(currentData);
        results.push(parsedData);
        currentData = "";
      } catch (e) {
        // 继续累计数据以便后续解析
      }
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
          id: toolCall.id,
          name: toolArgs.fileName || "Excel 文件",
          data: toolArgs.data || [],
        };
        break;
      // 其他工具可以继续扩展
      default:
        console.warn("[Tool] 未知工具：", toolName);
        result = `未知工具: ${toolName}`;
        break;
    }
    console.log("[Tool] 工具调用返回结果：", JSON.stringify(result, null, 2));
    return result;
  } catch (e: any) {
    console.error("[Tool] 工具调用处理出错：", e);
    throw e;
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
    console.log("已配置工具:", tools);
  }

  // 这里使用数组保存消息内容，每个块可为文本或结构化对象（如 excel）
  let contentBuffer: Array<{ type: string; text?: string } | any> = [];
  let reader;
  let totalUsage = null;
  let toolCallsProcessed = false;

  try {
    // 初始消息推送
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
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        dispatch(
          messageStreamEnd({
            id: messageId,
            content:
              contentBuffer.length > 0
                ? contentBuffer
                : [{ type: "text", text: "Empty response" }],
            role: "assistant",
            cybotId: cybotConfig.id,
          })
        );
        if (totalUsage) {
          dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
        }
        dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
        break;
      }

      const result = decoder.decode(value);
      const parsedResults = parseMultilineSSE(result);
      for (const parsedData of parsedResults) {
        console.log("[Debug] parsedData:", JSON.stringify(parsedData, null, 2));

        if (parsedData.error) {
          const errorMsg = `Error: ${parsedData.error.message}`;
          dispatch(
            messageStreamEnd({
              id: messageId,
              content:
                contentBuffer.length > 0
                  ? contentBuffer
                  : [{ type: "text", text: errorMsg }],
              role: "assistant",
              cybotId: cybotConfig.id,
            })
          );
          throw new Error(errorMsg);
        }

        const choice = parsedData.choices?.[0];
        if (!choice) continue;
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
          if (!toolCallsProcessed) {
            for (const toolCall of delta.tool_calls) {
              try {
                const toolResult = await processToolData(
                  toolCall,
                  dispatch,
                  cybotConfig,
                  messageId
                );
                // 如果返回对象且 type 为 "excel"，直接加入内容队列
                let newContentBuffer;
                if (
                  typeof toolResult === "object" &&
                  toolResult.type === "excel"
                ) {
                  newContentBuffer = [...contentBuffer, toolResult];
                } else {
                  newContentBuffer = [
                    ...contentBuffer,
                    { type: "text", text: "\n[Tool 执行结果] " + toolResult },
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
              } catch (toolError: any) {
                console.error("工具调用处理失败:", toolError);
                const newContentBuffer = [
                  ...contentBuffer,
                  {
                    type: "text",
                    text: "\n[Tool 执行失败: " + toolError.message + "]",
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
            toolCallsProcessed = true;
          }
          if (choice.finish_reason === "tool_calls") {
            console.log("接收到工具调用结束标识。");
            continue;
          }
        }

        // 处理正常文本内容
        const content = delta.content || "";
        if (parsedData.usage) {
          if (!totalUsage) {
            totalUsage = { ...parsedData.usage };
          } else {
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
          }
        }
        if (content) {
          console.log(
            "Before text update, contentBuffer:",
            contentBuffer,
            " frozen? ",
            Object.isFrozen(contentBuffer)
          );
          let newContentBuffer;
          if (
            contentBuffer.length > 0 &&
            contentBuffer[contentBuffer.length - 1].type === "text"
          ) {
            const lastText = contentBuffer[contentBuffer.length - 1].text;
            newContentBuffer = [
              ...contentBuffer.slice(0, contentBuffer.length - 1),
              { type: "text", text: lastText + content },
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
    console.error("请求失败:", error);
    const errorText =
      error.name === "AbortError" ? "\n[Interrupted]" : ": " + error.message;
    // 避免直接修改可能被冻结的数组，这里新建一个内容数组
    let newContentBuffer;
    if (
      contentBuffer.length > 0 &&
      contentBuffer[contentBuffer.length - 1].type === "text"
    ) {
      newContentBuffer = [
        ...contentBuffer.slice(0, contentBuffer.length - 1),
        {
          type: "text",
          text: contentBuffer[contentBuffer.length - 1].text + errorText,
        },
      ];
    } else {
      newContentBuffer = [...contentBuffer, { type: "text", text: errorText }];
    }
    contentBuffer = newContentBuffer;
    dispatch(
      messageStreamEnd({
        id: messageId,
        content: contentBuffer,
        role: "assistant",
        cybotId: cybotConfig.id,
      })
    );
    if (error.name !== "AbortError") {
      throw error;
    }
  } finally {
    if (reader) {
      reader.releaseLock();
    }
  }
};
