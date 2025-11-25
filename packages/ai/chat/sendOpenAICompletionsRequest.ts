// /ai/chat/sendOpenAICompletionsRequest.ts

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
import {
  toolRegistry,
  toolDefinitionsByName,
  findToolExecutor,
  ToolBehavior,
} from "../tools/toolRegistry";

// ============ 工具准备：保持你原来的行为（按 cybotConfig.tools 过滤） ============

export const prepareTools = (toolNames: string[]) => {
  return toolNames
    .map((toolName: string) => toolRegistry[toolName])
    .filter(Boolean); // 过滤掉未找到的工具
};

// 把 contentBuffer 中所有文本段拼成一段纯文本，用于 follow-up 总结
function contentBufferToPlainText(buffer: any[]): string {
  return buffer
    .filter((c) => c && c.type === "text" && c.text)
    .map((c) => String(c.text))
    .join("");
}

// 追加文本 chunk 到 contentBuffer（保持原实现）
function appendTextChunk(
  currentContentBuffer: any[],
  textChunk: string
): any[] {
  if (!textChunk) return currentContentBuffer;
  const updatedContentBuffer = [...currentContentBuffer];
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

// ============ 自动 follow-up 总结：基于 behavior 的策略 ============

async function autoFollowupIfNeeded(params: {
  toolCalls: any[];
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
  contentBuffer: any[];
}) {
  const {
    toolCalls,
    bodyData,
    cybotConfig,
    thunkApi,
    dialogKey,
    contentBuffer,
  } = params;
  const { dispatch } = thunkApi;

  if (!toolCalls || toolCalls.length === 0) return;

  // 1) 收集这轮调用的工具 behavior
  const behaviors = toolCalls
    .map((call) => {
      const func = call.function;
      if (!func?.name) return null;
      try {
        const { canonicalName } = findToolExecutor(func.name);
        const def = toolDefinitionsByName[canonicalName];
        return def?.behavior || null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ToolBehavior[];

  if (behaviors.length === 0) return;

  const hasOrchestrator = behaviors.includes("orchestrator");
  if (hasOrchestrator) {
    // createPlan / runStreamingAgent 等 orchestrator：外层不做自动总结
    return;
  }

  const hasDataTool = behaviors.includes("data");
  if (!hasDataTool) {
    // 只有 action / answer 工具：通常不需要自动总结
    return;
  }

  // 2) 有 data 工具且无 orchestrator → 触发自动总结
  const toolText = contentBufferToPlainText(contentBuffer);
  if (!toolText.trim()) return;

  const originalMessages = Array.isArray(bodyData.messages)
    ? bodyData.messages
    : [];

  const followupUserMessage = {
    role: "user",
    content:
      "上面是你刚刚通过工具获得的原始数据（包括 [Tool Result] 等中间输出）。" +
      "请在此基础上完整回答我最初的请求，直接给出对用户有帮助的总结和结论。" +
      "回答时可以省略工具执行过程，只保留对用户有价值的内容。\n\n" +
      toolText,
  };

  // 第二次调用：只做总结，不再允许 tools，以避免再次 tool_calls 死循环
  const { tools: _tools, tool_choice: _toolChoice, ...restBody } = bodyData;

  const followupBody = {
    ...restBody,
    messages: [...originalMessages, followupUserMessage],
  };

  await sendOpenAICompletionsRequest({
    bodyData: followupBody,
    cybotConfig,
    thunkApi,
    dialogKey,
    // 不传 parentMessageId：总结作为一条新的 assistant 消息
  });
}

// ============ 主流程：发送常规聊天请求（Completions + 工具） ============

export const sendOpenAICompletionsRequest = async ({
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

  // 按 agent 配置过滤可用工具（保持你原来的行为）
  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    if (tools.length > 0) {
      bodyData.tools = tools;
      if (!bodyData.tool_choice) {
        bodyData.tool_choice = "auto";
      }
    }
  }

  let contentBuffer: any[] = [];
  let totalUsage: any = null;
  let accumulatedToolCalls: any[] = [];
  let reasoningBuffer = "";
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let hasHandedOff = false;
  let hasProcessedToolCalls = false;
  let alreadyFinalized = false;

  const finalize = () => {
    if (hasHandedOff || alreadyFinalized) return;
    alreadyFinalized = true;
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
        // 流结束但还有累积的 tool_calls（例如最后一个 chunk 才给出）
        if (!hasProcessedToolCalls && accumulatedToolCalls.length > 0) {
          const toolCallsForThisTurn = accumulatedToolCalls;
          const result = await dispatch(
            handleToolCalls({
              accumulatedCalls: toolCallsForThisTurn,
              currentContentBuffer: contentBuffer,
              cybotConfig,
              messageId,
            })
          ).unwrap();

          contentBuffer = result.finalContentBuffer;
          hasProcessedToolCalls = true;

          if (result.hasHandedOff) {
            hasHandedOff = true;
          } else {
            // 工具结果已经写完，先结束第一条消息的 streaming
            finalize();

            // 再根据 behavior 决定是否自动 follow-up 总结
            await autoFollowupIfNeeded({
              toolCalls: toolCallsForThisTurn,
              bodyData,
              cybotConfig,
              thunkApi,
              dialogKey,
              contentBuffer,
            });
          }
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
              const toolCallsForThisTurn = accumulatedToolCalls;
              const result = await dispatch(
                handleToolCalls({
                  accumulatedCalls: toolCallsForThisTurn,
                  currentContentBuffer: contentBuffer,
                  cybotConfig,
                  messageId,
                })
              ).unwrap();

              contentBuffer = result.finalContentBuffer;
              accumulatedToolCalls = [];
              hasProcessedToolCalls = true;

              if (result.hasHandedOff) {
                hasHandedOff = true;
                await reader.cancel();
              } else {
                // 工具结果已经写完，先结束第一条消息的 streaming
                finalize();

                // 再根据 behavior 决定是否自动 follow-up 总结
                await autoFollowupIfNeeded({
                  toolCalls: toolCallsForThisTurn,
                  bodyData,
                  cybotConfig,
                  thunkApi,
                  dialogKey,
                  contentBuffer,
                });
              }
            } else if (finishReason !== "stop") {
              contentBuffer = appendTextChunk(
                contentBuffer,
                `\n[流结束原因: ${finishReason}]`
              );
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
