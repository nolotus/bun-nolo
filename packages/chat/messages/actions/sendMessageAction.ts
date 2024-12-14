import { read, setOne } from "database/dbSlice";
import { sendOpenAIRequest } from "ai/chat/sendOpenAIRequest";
import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { geminiModelNames } from "integrations/google/ai/models";
import { sendGeminiModelRequest } from "ai/chat/sendGeminiModelRequest";
import { selectCurrentUserId } from "auth/authSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { getWeather } from "ai/tools/getWeather";
import { getLogger } from "utils/logger";
import { readChunks } from "ai/client/stream";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";

import {
  addUserMessage,
  messagesReachedMax,
  messageStreamEnd,
  messageStreaming,
  streamLLmId,
  streamRequest,
} from "../messageSlice";
import { getFilteredMessages } from "../utils";

export const sendMessageAction = async (args, thunkApi) => {
  const { content } = args;
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  thunkApi.dispatch(addUserMessage({ content }));

  // after addUserMessage maybe multi cybot
  let prevMsgs = getFilteredMessages(state);
  const dialogConfig = selectCurrentDialogConfig(state);
  const cybotId = dialogConfig.cybots
    ? dialogConfig.cybots[0]
    : dialogConfig.llmId;

  const cybotConfig = await dispatch(read({ id: cybotId })).unwrap();

  console.log("cybotConfig", cybotConfig);

  const model = cybotConfig.model;
  if (cybotConfig.provider) {
    if (
      cybotConfig.provider === "deepinfra" ||
      cybotConfig.provider === "fireworks" ||
      cybotConfig.provider === "deepseek" ||
      cybotConfig.provider === "xai"
    ) {
      sendCommonChatRequest({
        content,
        cybotConfig,
        thunkApi,
      });
      return;
    }
  }
  if (cybotConfig.provider === "anthropic") {
    sendClaudeRequest({ cybotConfig, content, thunkApi });
    return;
  }

  if (model === "o1-mini" || model === "o1-preview") {
    sendOpenAIRequest(cybotId, content, thunkApi);
    return;
  }

  /// todo multi cybot could reply multi msg
  //for now just one

  // move to inside

  if (model && geminiModelNames.includes(model)) {
    sendGeminiModelRequest(dialogConfig, content, thunkApi);
    return;
  }

  if (cybotConfig.llmId) {
    await dispatch(streamLLmId({ cybotConfig, prevMsgs, content }));
    return;
  }
  const mode = "stream";
  if (mode === "stream") {
    console.log("here");
    const userId = selectCurrentUserId(state);
    const streamChat = async (content) => {
      const id = generateIdWithCustomId(userId, ulid(), {
        isJSON: true,
      });
      let temp: string;

      let functionTemp = "";
      let argumentsStr = "";
      let hasFunction = false;

      const controller = new AbortController();
      const signal = controller.signal;
      try {
        const action = await dispatch(
          streamRequest({
            content,
            prevMsgs,
            cybotConfig,
            signal,
            id,
          })
        );
        const { reader } = action.payload;

        const handleStreamData = async (id: string, text: string) => {
          const lines = text.trim().split("\n");
          for (const line of lines) {
            const match = line.match(/data: (done|{.*}|)/);
            if (match && match[1] !== undefined) {
              const statusOrJson: string = match[1];
              if (statusOrJson === "" || statusOrJson === "done") {
              } else {
                try {
                  const json = JSON.parse(statusOrJson);
                  if (json.choices) {
                    const delta = json.choices[0].delta;
                    if (delta.tool_calls) {
                      const callTools = delta.tool_calls[0];

                      // 处理function调用
                      if (callTools.function && callTools.function.name) {
                        hasFunction = true;
                        functionTemp = {
                          index: callTools.index,
                          id: callTools.id,
                          type: callTools.type,
                          function: {
                            name: callTools.function.name,
                            arguments: "",
                          },
                        };

                        // 显示思考状态
                        const message = {
                          id,
                          content: "思考中...",
                          cybotId,
                        };
                        thunkApi.dispatch(setOne(message));
                        thunkApi.dispatch(
                          messageStreaming({ ...message, controller })
                        );
                      }

                      // 累积arguments
                      if (callTools.function && callTools.function.arguments) {
                        argumentsStr += callTools.function.arguments;

                        try {
                          JSON.parse(argumentsStr); // 验证是完整的JSON
                          // 参数接收完整,可以执行function
                          functionTemp.function.arguments = argumentsStr;

                          // 这里执行function调用
                          const functionName = functionTemp.function.name;
                          const functionArgs = JSON.parse(
                            functionTemp.function.arguments
                          );

                          // 方式1: 直接执行
                          if (functionName === "get_current_weather") {
                            const result = await getWeather(functionArgs);
                            const message = {
                              content: result,
                              id,
                              cybotId,
                            };
                            console.log("function message", message);
                            thunkApi.dispatch(messageStreamEnd(message));
                          }

                          // 方式2: 通过dispatch触发
                          // thunkApi.dispatch(
                          //   executeFunctionCall({
                          //     name: functionName,
                          //     arguments: functionArgs,
                          //   }),
                          // );

                          // 清理状态
                          functionTemp = "";
                          argumentsStr = "";
                          hasFunction = false;
                        } catch (e) {
                          // 参数未接收完,继续等待
                        }
                      }
                    }

                    const finishReason: string = json.choices[0].finish_reason;
                    if (finishReason === "stop") {
                      // 只有在没有执行过function的情况下,才发送stop消息
                      if (!hasFunction) {
                        const message = {
                          content: temp,
                          id,
                          cybotId,
                        };
                        thunkApi.dispatch(messageStreamEnd(message));
                      }
                    } else if (
                      finishReason === "length" ||
                      finishReason === "content_filter"
                    ) {
                      thunkApi.dispatch(messagesReachedMax());
                    } else if (finishReason === "function_call") {
                      // function_call完成
                    } else if (!hasFunction) {
                      // 只在非function调用时更新消息
                      temp =
                        (temp || "") + (json.choices[0]?.delta?.content || "");
                      const message = {
                        role: "assistant",
                        id,
                        content: temp,
                        cybotId,
                      };
                      thunkApi.dispatch(setOne(message));
                      thunkApi.dispatch(
                        messageStreaming({ ...message, controller })
                      );
                    }
                  }
                } catch (e) {}
              }
            }
          }
        };
        await readChunks({ reader, id }, handleStreamData);
      } catch (error) {
        // 处理错误
        return { error: { status: "FETCH_ERROR", data: error.message } };
      }
    };
    await streamChat(content);
  }
};
