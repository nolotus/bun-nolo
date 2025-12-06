// chat/sendOpenAICompletionsRequest.ts（或你的原始文件名）

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
import { createSSEParser } from "./parseMultilineSSE";
import { parseApiError } from "./parseApiError";
import { updateTotalUsage } from "./updateTotalUsage";
import { accumulateToolCallChunks } from "./accumulateToolCallChunks";
import { prepareTools } from "../tools/prepareTools";

// 追加文本 chunk 到 contentBuffer
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

// 自动 follow‑up 总结逻辑
async function autoFollowupIfNeeded(params: {
  hasOrchestrator: boolean;
  hasDataTool: boolean;
  toolTextForFollowup: string;
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
}) {
  const {
    hasOrchestrator,
    hasDataTool,
    toolTextForFollowup,
    bodyData,
    cybotConfig,
    thunkApi,
    dialogKey,
  } = params;
  const { dispatch } = thunkApi;

  // 有 orchestrator 工具时，不再自动总结
  if (hasOrchestrator) return;
  // 没有 data 工具输出时，也不需要自动总结
  if (!hasDataTool) return;

  const toolText = String(toolTextForFollowup || "");
  if (!toolText.trim()) return;

  const originalMessages = Array.isArray(bodyData.messages)
    ? bodyData.messages
    : [];

  const followupUserMessage = {
    role: "user",
    content:
      "上面是你刚刚通过工具获得的原始数据（包括中间输出）。" +
      "请在此基础上完整回答我最初的请求，直接给出对用户有帮助的总结和结论。" +
      "回答时可以省略工具执行过程，只保留对用户有价值的内容。\n\n" +
      toolText,
  };

  // 从 bodyData 里去掉 tools / tool_choice（基础层）
  const { tools: _tools, tool_choice: _toolChoice, ...restBody } = bodyData;

  const followupBody = {
    ...restBody,
    messages: [...originalMessages, followupUserMessage],
  };

  // 关键：这一次 follow‑up 请求，彻底禁用工具
  await sendOpenAICompletionsRequest({
    bodyData: followupBody,
    cybotConfig,
    thunkApi,
    dialogKey,
    disableToolsForThisRequest: true, // ⭐ 自动总结这轮禁止工具
    // 不传 parentMessageId：总结作为一条新的 assistant 消息
  });
}

// 主流程：发送请求 + 处理流式 SSE + 工具调用
export const sendOpenAICompletionsRequest = async ({
  bodyData,
  cybotConfig,
  thunkApi,
  dialogKey,
  parentMessageId,
  disableToolsForThisRequest = false, // ⭐ 新增参数，默认允许工具
}: {
  bodyData: any;
  cybotConfig: any;
  thunkApi: any;
  dialogKey: string;
  parentMessageId?: string;
  disableToolsForThisRequest?: boolean; // ⭐ 新增
}) => {
  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());
  const signal = controller.signal;

  let messageId: string;
  let msgKey: string;

  if (parentMessageId) {
    // 作为某条消息的后续（比如工具自动 follow-up）
    messageId = parentMessageId;
    msgKey = `msg:${dialogId}:${messageId}`;
  } else {
    // 正常新建一条 assistant 消息
    const newIds = createDialogMessageKeyAndId(dialogId);
    messageId = newIds.messageId;
    msgKey = newIds.key;
  }

  dispatch(addActiveController({ messageId, controller }));

  // tools 配置：如果 cybot 带工具，则在请求体里挂上 tools / tool_choice
  // ⭐ 这里加入 disableToolsForThisRequest 判断
  if (!disableToolsForThisRequest && cybotConfig.tools?.length > 0) {
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

  // 为本次请求创建独立的 SSE 解析器实例
  const parseSSE = createSSEParser();

  try {
    // 如果不是 follow-up，总是先插入一条 streaming 的 assistant 消息
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
        console.log(
          "[SSE] stream done. hasProcessedToolCalls:",
          hasProcessedToolCalls,
          "accumulatedToolCalls length:",
          accumulatedToolCalls.length
        );

        // 流结束但还有累积的 tool_calls（模型在最后一个 chunk 才把工具调用发完）
        if (!hasProcessedToolCalls && accumulatedToolCalls.length > 0) {
          const toolCallsForThisTurn = accumulatedToolCalls;
          console.log(
            "[SSE] final toolCallsForThisTurn (on done):",
            JSON.stringify(toolCallsForThisTurn, null, 2)
          );

          const result = await dispatch(
            handleToolCalls({
              accumulatedCalls: toolCallsForThisTurn,
              currentContentBuffer: contentBuffer,
              cybotConfig,
              messageId,
              dialogId,
            })
          ).unwrap();

          contentBuffer = result.finalContentBuffer;
          hasProcessedToolCalls = true;

          if (result.hasHandedOff) {
            hasHandedOff = true;
          } else {
            finalize();
            await autoFollowupIfNeeded({
              hasOrchestrator: result.hadOrchestrator,
              hasDataTool: result.hasDataTool,
              toolTextForFollowup: result.toolTextForFollowup,
              bodyData,
              cybotConfig,
              thunkApi,
              dialogKey,
            });
          }
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const parsedResults = parseSSE(chunk);

      console.log(
        "[SSE] parsedResults:",
        JSON.stringify(parsedResults, null, 2)
      );

      for (const parsedData of parsedResults) {
        const dataList = Array.isArray(parsedData) ? parsedData : [parsedData];
        for (const data of dataList) {
          if (data.usage) {
            totalUsage = updateTotalUsage(totalUsage, data.usage);
          }

          if (data.error) {
            const errorMsg = `Error: ${
              data.error.message || JSON.stringify(data.error)
            }`;
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

          // 推理内容缓冲
          if (delta.reasoning_content) {
            reasoningBuffer += delta.reasoning_content;
          }

          // 处理工具调用增量
          if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
            console.log(
              "[SSE] delta.tool_calls chunk:",
              JSON.stringify(delta.tool_calls, null, 2)
            );

            accumulatedToolCalls = accumulateToolCallChunks(
              accumulatedToolCalls,
              delta.tool_calls
            );

            console.log(
              "[SSE] accumulatedToolCalls so far:",
              JSON.stringify(accumulatedToolCalls, null, 2)
            );
          }

          // 普通文本内容增量
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
            console.log(
              "[SSE] finish_reason:",
              finishReason,
              "accumulatedToolCalls length:",
              accumulatedToolCalls.length
            );

            if (finishReason === "tool_calls") {
              const toolCallsForThisTurn = accumulatedToolCalls;
              console.log(
                "[SSE] toolCallsForThisTurn (on finish_reason=tool_calls):",
                JSON.stringify(toolCallsForThisTurn, null, 2)
              );

              const result = await dispatch(
                handleToolCalls({
                  accumulatedCalls: toolCallsForThisTurn,
                  currentContentBuffer: contentBuffer,
                  cybotConfig,
                  messageId,
                  dialogId,
                })
              ).unwrap();

              contentBuffer = result.finalContentBuffer;
              accumulatedToolCalls = [];
              hasProcessedToolCalls = true;

              if (result.hasHandedOff) {
                hasHandedOff = true;
                await reader.cancel();
              } else {
                finalize();
                await autoFollowupIfNeeded({
                  hasOrchestrator: result.hadOrchestrator,
                  hasDataTool: result.hasDataTool,
                  toolTextForFollowup: result.toolTextForFollowup,
                  bodyData,
                  cybotConfig,
                  thunkApi,
                  dialogKey,
                });
              }
            } else if (finishReason !== "stop") {
              // 其它 finish_reason（如 length、content_filter）
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
    console.error("[SSE] sendOpenAICompletionsRequest error:", error);
    contentBuffer = appendTextChunk(contentBuffer, errorText);
    finalize();
  } finally {
    dispatch(removeActiveController(messageId));
    try {
      await reader?.cancel();
    } catch (_e) {}
  }
};
